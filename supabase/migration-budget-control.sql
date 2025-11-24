-- ================================================================
-- MIGRACIÓN: SISTEMA DE CONTROL DE COSTES Y PROCESAMIENTO
-- ================================================================
-- Descripción: Añade tablas para control de presupuesto, cola de
--              procesamiento y checkpoints para procesamiento resiliente
-- Fecha: 2025-11-24
-- ================================================================

-- ================================================================
-- 1. TABLA: presupuesto_control
-- ================================================================
-- Controla límites y gastos de procesamiento LLM
CREATE TABLE IF NOT EXISTS presupuesto_control (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Límites de presupuesto (en USD)
    limite_diario DECIMAL(10,2) DEFAULT 10.00,
    limite_semanal DECIMAL(10,2) DEFAULT 50.00,
    limite_mensual DECIMAL(10,2) DEFAULT 150.00,

    -- Gastos actuales (en USD)
    gasto_dia_actual DECIMAL(10,4) DEFAULT 0.00,
    gasto_semana_actual DECIMAL(10,4) DEFAULT 0.00,
    gasto_mes_actual DECIMAL(10,4) DEFAULT 0.00,

    -- Control de periodos
    ultimo_reset_diario DATE DEFAULT CURRENT_DATE,
    ultimo_reset_semanal DATE DEFAULT CURRENT_DATE,
    ultimo_reset_mensual DATE DEFAULT CURRENT_DATE,

    -- Control de procesamiento
    procesamiento_activo BOOLEAN DEFAULT true,
    razon_pausa TEXT,
    pausado_en TIMESTAMP WITH TIME ZONE,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Solo debe haber un registro de control
CREATE UNIQUE INDEX idx_presupuesto_singleton ON presupuesto_control((id IS NOT NULL));

-- Insertar registro inicial
INSERT INTO presupuesto_control (limite_diario, limite_semanal, limite_mensual)
VALUES (10.00, 50.00, 150.00)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE presupuesto_control IS 'Control de presupuesto para procesamiento LLM con límites diarios/semanales/mensuales';

-- ================================================================
-- 2. TABLA: cola_procesamiento
-- ================================================================
-- Cola de documentos pendientes de procesamiento con prioridades
CREATE TABLE IF NOT EXISTS cola_procesamiento (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Identificación del documento
    boe_id VARCHAR(100) NOT NULL,
    nivel_procesamiento INTEGER NOT NULL, -- 1=clasificar, 2=extraer, 3=explicar

    -- Prioridad y estado
    prioridad INTEGER DEFAULT 0, -- 0=normal, 1=alta (P3), 2=urgente (usuario)
    estado VARCHAR(20) DEFAULT 'pendiente', -- 'pendiente', 'procesando', 'completado', 'error'

    -- Control de costes
    costo_estimado DECIMAL(10,4),
    costo_real DECIMAL(10,4),

    -- Control de reintentos
    intentos INTEGER DEFAULT 0,
    max_intentos INTEGER DEFAULT 3,
    ultimo_intento TIMESTAMP WITH TIME ZONE,
    ultimo_error TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}',
    fecha_agregado TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_completado TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices para consultas eficientes
CREATE INDEX idx_cola_boe_id ON cola_procesamiento(boe_id);
CREATE INDEX idx_cola_estado ON cola_procesamiento(estado);
CREATE INDEX idx_cola_prioridad ON cola_procesamiento(prioridad DESC, fecha_agregado ASC);
CREATE INDEX idx_cola_nivel ON cola_procesamiento(nivel_procesamiento);

-- Unicidad: un documento solo puede estar una vez en la cola por nivel
CREATE UNIQUE INDEX idx_cola_unique ON cola_procesamiento(boe_id, nivel_procesamiento);

COMMENT ON TABLE cola_procesamiento IS 'Cola de procesamiento con prioridades y control de reintentos';

-- ================================================================
-- 3. TABLA: procesamiento_checkpoints
-- ================================================================
-- Checkpoints para procesamiento resiliente por lotes
CREATE TABLE IF NOT EXISTS procesamiento_checkpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Identificación del batch
    tipo_batch VARCHAR(20) NOT NULL, -- 'diario', 'semanal', 'mensual', 'on-demand'
    fecha_batch_inicio DATE NOT NULL,
    fecha_batch_fin DATE NOT NULL,

    -- Estado del procesamiento
    estado VARCHAR(20) DEFAULT 'en_progreso', -- 'en_progreso', 'pausado', 'completado', 'error'

    -- Progreso
    total_documentos INTEGER DEFAULT 0,
    documentos_procesados INTEGER DEFAULT 0,
    documentos_fallidos INTEGER DEFAULT 0,
    ultimo_doc_procesado VARCHAR(100),

    -- Control de costes
    costo_estimado_total DECIMAL(10,4),
    costo_acumulado DECIMAL(10,4) DEFAULT 0.00,

    -- Timestamps
    fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_pausa TIMESTAMP WITH TIME ZONE,
    fecha_completado TIMESTAMP WITH TIME ZONE,

    -- Control de pausa
    razon_pausa TEXT,
    puede_reanudar BOOLEAN DEFAULT true,

    -- Metadata detallada
    metadata JSONB DEFAULT '{}', -- {categoria_id: {procesados: X, errores: Y}}

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices
CREATE INDEX idx_checkpoint_tipo ON procesamiento_checkpoints(tipo_batch);
CREATE INDEX idx_checkpoint_estado ON procesamiento_checkpoints(estado);
CREATE INDEX idx_checkpoint_fecha ON procesamiento_checkpoints(fecha_inicio DESC);
CREATE INDEX idx_checkpoint_batch_dates ON procesamiento_checkpoints(fecha_batch_inicio, fecha_batch_fin);

COMMENT ON TABLE procesamiento_checkpoints IS 'Checkpoints para procesamiento resiliente con capacidad de pausa y reanudación';

-- ================================================================
-- TRIGGERS PARA UPDATED_AT
-- ================================================================

CREATE TRIGGER update_presupuesto_updated_at BEFORE UPDATE ON presupuesto_control
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cola_updated_at BEFORE UPDATE ON cola_procesamiento
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checkpoint_updated_at BEFORE UPDATE ON procesamiento_checkpoints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- FUNCIONES HELPER
-- ================================================================

-- Función para resetear gastos automáticamente según el periodo
CREATE OR REPLACE FUNCTION reset_budget_if_needed()
RETURNS void AS $$
DECLARE
    control_record presupuesto_control;
BEGIN
    SELECT * INTO control_record FROM presupuesto_control LIMIT 1;

    -- Reset diario
    IF control_record.ultimo_reset_diario < CURRENT_DATE THEN
        UPDATE presupuesto_control SET
            gasto_dia_actual = 0.00,
            ultimo_reset_diario = CURRENT_DATE;
    END IF;

    -- Reset semanal (lunes = 1)
    IF EXTRACT(DOW FROM CURRENT_DATE) = 1 AND
       control_record.ultimo_reset_semanal < CURRENT_DATE THEN
        UPDATE presupuesto_control SET
            gasto_semana_actual = 0.00,
            ultimo_reset_semanal = CURRENT_DATE;
    END IF;

    -- Reset mensual (día 1)
    IF EXTRACT(DAY FROM CURRENT_DATE) = 1 AND
       control_record.ultimo_reset_mensual < CURRENT_DATE THEN
        UPDATE presupuesto_control SET
            gasto_mes_actual = 0.00,
            ultimo_reset_mensual = CURRENT_DATE;
    END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION reset_budget_if_needed() IS 'Resetea automáticamente los gastos según el periodo (día/semana/mes)';

-- ================================================================
-- VISTAS ÚTILES
-- ================================================================

-- Vista: Estado actual del presupuesto
CREATE OR REPLACE VIEW v_estado_presupuesto AS
SELECT
    limite_diario,
    gasto_dia_actual,
    (limite_diario - gasto_dia_actual) as restante_diario,
    ROUND((gasto_dia_actual / NULLIF(limite_diario, 0)) * 100, 2) as porcentaje_usado_diario,

    limite_semanal,
    gasto_semana_actual,
    (limite_semanal - gasto_semana_actual) as restante_semanal,
    ROUND((gasto_semana_actual / NULLIF(limite_semanal, 0)) * 100, 2) as porcentaje_usado_semanal,

    limite_mensual,
    gasto_mes_actual,
    (limite_mensual - gasto_mes_actual) as restante_mensual,
    ROUND((gasto_mes_actual / NULLIF(limite_mensual, 0)) * 100, 2) as porcentaje_usado_mensual,

    procesamiento_activo,
    razon_pausa,
    ultimo_reset_diario,
    ultimo_reset_semanal,
    ultimo_reset_mensual
FROM presupuesto_control
LIMIT 1;

COMMENT ON VIEW v_estado_presupuesto IS 'Vista con estado actual del presupuesto y gastos';

-- Vista: Resumen de cola de procesamiento
CREATE OR REPLACE VIEW v_resumen_cola AS
SELECT
    estado,
    nivel_procesamiento,
    prioridad,
    COUNT(*) as total,
    SUM(costo_estimado) as costo_estimado_total,
    AVG(intentos) as intentos_promedio
FROM cola_procesamiento
GROUP BY estado, nivel_procesamiento, prioridad
ORDER BY prioridad DESC, nivel_procesamiento, estado;

COMMENT ON VIEW v_resumen_cola IS 'Resumen agrupado de la cola de procesamiento';

-- Vista: Checkpoints activos
CREATE OR REPLACE VIEW v_checkpoints_activos AS
SELECT
    id,
    tipo_batch,
    estado,
    fecha_batch_inicio,
    fecha_batch_fin,
    total_documentos,
    documentos_procesados,
    ROUND((documentos_procesados::NUMERIC / NULLIF(total_documentos, 0)) * 100, 2) as progreso_porcentaje,
    costo_acumulado,
    EXTRACT(EPOCH FROM (COALESCE(fecha_completado, fecha_pausa, NOW()) - fecha_inicio)) / 60 as duracion_minutos,
    razon_pausa
FROM procesamiento_checkpoints
WHERE estado IN ('en_progreso', 'pausado')
ORDER BY fecha_inicio DESC;

COMMENT ON VIEW v_checkpoints_activos IS 'Checkpoints que están en progreso o pausados';

-- ================================================================
-- PERMISOS (si se usa RLS)
-- ================================================================

-- Las tablas de control son de solo lectura para usuarios normales
-- Solo las funciones serverless pueden escribir

-- ================================================================
-- FIN DE LA MIGRACIÓN
-- ================================================================
-- Para ejecutar esta migración:
-- 1. Asegúrate de que schema.sql ya está ejecutado
-- 2. Ir a SQL Editor en Supabase
-- 3. Copiar y pegar este archivo completo
-- 4. Ejecutar
-- 5. Verificar que las 3 nuevas tablas se crearon correctamente
-- ================================================================
