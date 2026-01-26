# 🚀 Setup de Supabase - Pasos Manuales

**IMPORTANTE**: Debes ejecutar estos pasos manualmente en el dashboard de Supabase.

---

## Paso 1: Abrir Supabase SQL Editor

1. Ve a: https://supabase.com/dashboard/project/vvjugtnydefxmqvfcooq
2. En el sidebar izquierdo, haz clic en **"SQL Editor"**
3. Haz clic en **"New query"**

---

## Paso 2: Copiar el Schema SQL

1. Abre el archivo `supabase/schema.sql` en tu editor
2. **Copia TODO el contenido** (es un archivo grande, ~800 líneas)
3. Pega el contenido en el SQL Editor de Supabase

---

## Paso 3: Ejecutar el Schema

1. Revisa que todo el contenido esté pegado correctamente
2. Haz clic en el botón **"Run"** (esquina inferior derecha)
3. Espera a que termine la ejecución (puede tardar 10-20 segundos)
4. Deberías ver: **✅ "Success. No rows returned"**

Si ves algún error, copia el mensaje y avísame.

---

## Paso 4: Verificar que se crearon las tablas

1. En el sidebar izquierdo, haz clic en **"Table Editor"**
2. Deberías ver **9 tablas** creadas:
   - ✅ `categorias`
   - ✅ `documentos_boe`
   - ✅ `explicaciones_llm`
   - ✅ `estadisticas_categorias`
   - ✅ `faqs`
   - ✅ `favoritos`
   - ✅ `alertas_usuario`
   - ✅ `procesamiento_log`
   - ✅ `feedback_usuarios`

---

## Paso 5: Verificar las categorías

1. Haz clic en la tabla **`categorias`**
2. Deberías ver **12 filas** (categorías):
   - 📝 Oposiciones y Concursos
   - 💰 Subvenciones y Ayudas
   - ⚖️ Cambios Legislativos
   - 👔 Nombramientos y Ceses
   - 🏗️ Licitaciones Públicas
   - 🎓 Educación y Becas
   - 🏠 Vivienda
   - 💼 Empleo y Relaciones Laborales
   - 🌱 Medio Ambiente
   - 🚗 Tráfico y Movilidad
   - 🏥 Salud
   - 💻 Tecnología y Telecomunicaciones

---

## ✅ Verificación Final

Si ves las 9 tablas y las 12 categorías, **¡el setup está completo!**

Ahora puedes:
1. Probar la conexión ejecutando: `npm run dev`
2. Visitar: http://localhost:3000/categorias
3. Deberías ver las 12 categorías listadas

---

## ❌ Troubleshooting

### Error: "relation already exists"

**Causa:** Ya ejecutaste el schema anteriormente

**Solución:**
1. Si quieres empezar de cero, elimina las tablas existentes
2. O simplemente ignora este error y continúa

### Error: "permission denied"

**Causa:** No tienes permisos de administrador

**Solución:**
1. Verifica que estás logueado en Supabase
2. Verifica que estás en el proyecto correcto
3. Intenta cerrar sesión y volver a entrar

### No veo las categorías

**Solución:**
1. Ve al SQL Editor
2. Ejecuta solo esta parte del schema (busca "INSERT INTO categorias"):

```sql
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
```

---

**Una vez completados estos pasos, avísame y continuamos con el deployment!** 🚀
