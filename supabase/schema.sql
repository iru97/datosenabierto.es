-- ================================================================
-- SCHEMA DE BASE DE DATOS PARA DATOSENABIERTO.ES
-- ================================================================
-- Descripción: Schema completo para almacenar documentos BOE
--              procesados semanalmente con explicaciones LLM
-- Fecha: 2025-11-24
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- 1. TABLA: categorias
-- ================================================================
-- Almacena las 12 categorías principales del BOE
CREATE TABLE categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    prioridad INTEGER DEFAULT 0, -- 1-3, siendo 3 máxima prioridad
    icono VARCHAR(50), -- Emoji o nombre de icono
    color VARCHAR(7), -- Color hex para UI
    activa BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_categorias_slug ON categorias(slug);
CREATE INDEX idx_categorias_prioridad ON categorias(prioridad DESC);
CREATE INDEX idx_categorias_activa ON categorias(activa);

-- ================================================================
-- 2. TABLA: documentos_boe
-- ================================================================
-- Almacena todos los documentos BOE procesados
CREATE TABLE documentos_boe (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    boe_id VARCHAR(100) UNIQUE NOT NULL, -- ID oficial del BOE
    categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
    fecha_publicacion DATE NOT NULL,
    titulo TEXT NOT NULL,
    seccion VARCHAR(100), -- "I", "II", "III", "IV", "V"
    departamento TEXT,
    rango VARCHAR(100), -- "Ley", "Real Decreto", "Orden", etc.
    url_pdf TEXT,
    url_xml TEXT,

    -- Datos estructurados extraídos del documento
    datos_estructurados JSONB DEFAULT '{}',

    -- Fechas importantes extraídas (plazos, vencimientos, etc.)
    fechas_importantes JSONB DEFAULT '[]', -- Array de {tipo, fecha, descripcion}

    -- Keywords para búsqueda
    keywords TEXT[],

    -- Metadata adicional
    metadata JSONB DEFAULT '{}',

    -- Control
    procesado BOOLEAN DEFAULT false,
    procesado_at TIMESTAMP WITH TIME ZONE,
    error_procesamiento TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_documentos_boe_id ON documentos_boe(boe_id);
CREATE INDEX idx_documentos_fecha_publicacion ON documentos_boe(fecha_publicacion DESC);
CREATE INDEX idx_documentos_categoria ON documentos_boe(categoria_id);
CREATE INDEX idx_documentos_procesado ON documentos_boe(procesado);
CREATE INDEX idx_documentos_keywords ON documentos_boe USING GIN(keywords);
CREATE INDEX idx_documentos_datos ON documentos_boe USING GIN(datos_estructurados);
CREATE INDEX idx_documentos_fechas ON documentos_boe USING GIN(fechas_importantes);

-- ================================================================
-- 3. TABLA: explicaciones_llm
-- ================================================================
-- Almacena las explicaciones generadas por LLM para cada documento
CREATE TABLE explicaciones_llm (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    documento_id UUID REFERENCES documentos_boe(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL, -- 'resumen', 'que_es', 'como_afecta', 'pasos', 'requisitos'
    contenido TEXT NOT NULL,

    -- Metadata del LLM
    modelo_usado VARCHAR(50), -- 'claude-3-5-haiku-20241022'
    tokens_usados INTEGER,
    tokens_input INTEGER,
    tokens_output INTEGER,
    tiempo_generacion_ms INTEGER,

    -- Control de calidad
    calidad_score DECIMAL(3,2), -- 0.00 - 1.00 (opcional, para validación)
    validado BOOLEAN DEFAULT false,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_explicaciones_documento ON explicaciones_llm(documento_id);
CREATE INDEX idx_explicaciones_tipo ON explicaciones_llm(tipo);
CREATE INDEX idx_explicaciones_created ON explicaciones_llm(created_at DESC);

-- ================================================================
-- 4. TABLA: estadisticas_categorias
-- ================================================================
-- Almacena estadísticas semanales por categoría generadas por LLM
CREATE TABLE estadisticas_categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    categoria_id UUID REFERENCES categorias(id) ON DELETE CASCADE,
    semana_inicio DATE NOT NULL,
    semana_fin DATE NOT NULL,

    -- Métricas numéricas
    total_documentos INTEGER DEFAULT 0,
    documentos_importantes INTEGER DEFAULT 0,

    -- Análisis LLM
    resumen_semanal TEXT, -- Resumen general de la semana
    tendencias TEXT, -- Tendencias detectadas
    insights TEXT, -- Insights importantes para usuarios
    documentos_destacados JSONB DEFAULT '[]', -- Array de documento_ids destacados

    -- Metadata del LLM
    modelo_usado VARCHAR(50),
    tokens_usados INTEGER,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_estadisticas_categoria ON estadisticas_categorias(categoria_id);
CREATE INDEX idx_estadisticas_semana ON estadisticas_categorias(semana_inicio DESC);
CREATE UNIQUE INDEX idx_estadisticas_categoria_semana ON estadisticas_categorias(categoria_id, semana_inicio);

-- ================================================================
-- 5. TABLA: faqs
-- ================================================================
-- Preguntas frecuentes generadas por categoría
CREATE TABLE faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    categoria_id UUID REFERENCES categorias(id) ON DELETE CASCADE,
    pregunta TEXT NOT NULL,
    respuesta TEXT NOT NULL,
    orden INTEGER DEFAULT 0,
    veces_vista INTEGER DEFAULT 0,
    util_count INTEGER DEFAULT 0, -- Cuántas veces marcaron como útil
    no_util_count INTEGER DEFAULT 0, -- Cuántas veces marcaron como no útil
    activa BOOLEAN DEFAULT true,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_faqs_categoria ON faqs(categoria_id);
CREATE INDEX idx_faqs_orden ON faqs(orden);
CREATE INDEX idx_faqs_activa ON faqs(activa);

-- ================================================================
-- 6. TABLA: favoritos
-- ================================================================
-- Favoritos de usuarios (requiere auth, opcional)
CREATE TABLE favoritos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- De Supabase Auth
    documento_id UUID REFERENCES documentos_boe(id) ON DELETE CASCADE,
    notas TEXT, -- Notas personales del usuario

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_favoritos_user ON favoritos(user_id);
CREATE INDEX idx_favoritos_documento ON favoritos(documento_id);
CREATE UNIQUE INDEX idx_favoritos_user_documento ON favoritos(user_id, documento_id);

-- ================================================================
-- 7. TABLA: alertas_usuario
-- ================================================================
-- Alertas configuradas por usuarios (requiere auth, opcional)
CREATE TABLE alertas_usuario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- De Supabase Auth
    categoria_id UUID REFERENCES categorias(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    keywords TEXT[], -- Keywords para filtrar
    frecuencia VARCHAR(20) DEFAULT 'semanal', -- 'semanal', 'mensual'
    activa BOOLEAN DEFAULT true,
    ultima_ejecucion TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_alertas_user ON alertas_usuario(user_id);
CREATE INDEX idx_alertas_categoria ON alertas_usuario(categoria_id);
CREATE INDEX idx_alertas_activa ON alertas_usuario(activa);

-- ================================================================
-- 8. TABLA: procesamiento_log
-- ================================================================
-- Log de ejecuciones de la función semanal
CREATE TABLE procesamiento_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    fecha_fin TIMESTAMP WITH TIME ZONE,
    semana_procesada_inicio DATE NOT NULL,
    semana_procesada_fin DATE NOT NULL,

    -- Estadísticas de la ejecución
    total_documentos_procesados INTEGER DEFAULT 0,
    total_explicaciones_generadas INTEGER DEFAULT 0,
    total_tokens_usados INTEGER DEFAULT 0,
    total_costo_estimado DECIMAL(10,4), -- En USD

    -- Estado
    estado VARCHAR(20) DEFAULT 'iniciado', -- 'iniciado', 'completado', 'error'
    error_mensaje TEXT,

    -- Metadata detallada
    metadata JSONB DEFAULT '{}', -- Detalles por categoría, errores, etc.

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_procesamiento_fecha ON procesamiento_log(fecha_inicio DESC);
CREATE INDEX idx_procesamiento_estado ON procesamiento_log(estado);

-- ================================================================
-- 9. TABLA: feedback_usuarios
-- ================================================================
-- Feedback de usuarios sobre explicaciones y contenido
CREATE TABLE feedback_usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo VARCHAR(50) NOT NULL, -- 'explicacion', 'categoria', 'general'
    referencia_id UUID, -- ID de explicacion_llm o categoria
    user_id UUID, -- Opcional, puede ser anónimo

    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comentario TEXT,
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_feedback_tipo ON feedback_usuarios(tipo);
CREATE INDEX idx_feedback_referencia ON feedback_usuarios(referencia_id);
CREATE INDEX idx_feedback_created ON feedback_usuarios(created_at DESC);

-- ================================================================
-- FUNCIONES Y TRIGGERS
-- ================================================================

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a tablas relevantes
CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON categorias
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documentos_updated_at BEFORE UPDATE ON documentos_boe
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alertas_updated_at BEFORE UPDATE ON alertas_usuario
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================================

-- Habilitar RLS en tablas sensibles
ALTER TABLE favoritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas_usuario ENABLE ROW LEVEL SECURITY;

-- Políticas para favoritos: usuarios solo ven sus propios favoritos
CREATE POLICY "Users can view own favorites" ON favoritos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON favoritos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own favorites" ON favoritos
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON favoritos
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para alertas: usuarios solo ven sus propias alertas
CREATE POLICY "Users can view own alerts" ON alertas_usuario
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alerts" ON alertas_usuario
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts" ON alertas_usuario
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own alerts" ON alertas_usuario
    FOR DELETE USING (auth.uid() = user_id);

-- Las demás tablas son de lectura pública (categorias, documentos_boe, etc.)
-- No necesitan RLS porque son solo de lectura para el público

-- ================================================================
-- DATOS INICIALES: CATEGORÍAS
-- ================================================================

INSERT INTO categorias (slug, nombre, descripcion, prioridad, icono, color) VALUES
('oposiciones', 'Oposiciones y Concursos', 'Convocatorias de oposiciones, concursos públicos, listas de admitidos/excluidos, fechas de exámenes y resultados', 3, '📝', '#3B82F6'),
('ayudas', 'Subvenciones y Ayudas', 'Subvenciones públicas, ayudas económicas, becas, bonificaciones y líneas de financiación disponibles', 3, '💰', '#10B981'),
('legislacion', 'Cambios Legislativos', 'Nuevas leyes, decretos, reglamentos y modificaciones normativas que afectan a ciudadanos y empresas', 3, '⚖️', '#8B5CF6'),
('nombramientos', 'Nombramientos y Ceses', 'Nombramientos, ceses y cambios en cargos públicos de relevancia nacional', 2, '👔', '#F59E0B'),
('licitaciones', 'Licitaciones Públicas', 'Licitaciones, contratos del sector público y concursos de obras y servicios', 2, '🏗️', '#EF4444'),
('educacion', 'Educación y Becas', 'Convocatorias educativas, becas de estudio, homologaciones de títulos y planes de estudio', 2, '🎓', '#06B6D4'),
('vivienda', 'Vivienda', 'Ayudas a la vivienda, planes de alquiler, rehabilitación y acceso a vivienda protegida', 2, '🏠', '#EC4899'),
('empleo', 'Empleo y Relaciones Laborales', 'Normativa laboral, convenios colectivos, salarios mínimos y derechos laborales', 2, '💼', '#6366F1'),
('medio-ambiente', 'Medio Ambiente', 'Normativa ambiental, espacios protegidos, gestión de residuos y sostenibilidad', 2, '🌱', '#14B8A6'),
('trafico', 'Tráfico y Movilidad', 'Normativa de tráfico, permisos de conducir, seguridad vial y transporte', 1, '🚗', '#F97316'),
('salud', 'Salud', 'Normativa sanitaria, autorizaciones de medicamentos, seguridad alimentaria y salud pública', 2, '🏥', '#EF4444'),
('tecnologia', 'Tecnología y Telecomunicaciones', 'Regulación tecnológica, telecomunicaciones, protección de datos y administración digital', 2, '💻', '#8B5CF6');

-- ================================================================
-- COMENTARIOS SOBRE TABLAS
-- ================================================================

COMMENT ON TABLE categorias IS 'Categorías principales para clasificar documentos BOE';
COMMENT ON TABLE documentos_boe IS 'Documentos BOE procesados con datos estructurados extraídos';
COMMENT ON TABLE explicaciones_llm IS 'Explicaciones generadas por LLM para cada documento';
COMMENT ON TABLE estadisticas_categorias IS 'Estadísticas y análisis semanales por categoría';
COMMENT ON TABLE faqs IS 'Preguntas frecuentes por categoría';
COMMENT ON TABLE favoritos IS 'Favoritos guardados por usuarios registrados';
COMMENT ON TABLE alertas_usuario IS 'Alertas configuradas por usuarios registrados';
COMMENT ON TABLE procesamiento_log IS 'Log de ejecuciones de la función de procesamiento semanal';
COMMENT ON TABLE feedback_usuarios IS 'Feedback de usuarios sobre contenido y explicaciones';

-- ================================================================
-- FIN DEL SCHEMA
-- ================================================================
-- Para ejecutar este schema:
-- 1. Crear proyecto en Supabase: https://supabase.com
-- 2. Ir a SQL Editor
-- 3. Copiar y pegar este archivo completo
-- 4. Ejecutar
-- 5. Verificar que todas las tablas se crearon correctamente
-- ================================================================
