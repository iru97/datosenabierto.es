<template>
  <div class="card-wrapper">
    <!-- Urgency indicator (conditional) -->
    <div
      v-if="urgencyLevel"
      :class="['urgency-badge', `urgency-${urgencyLevel}`]"
    >
      <span class="urgency-icon">{{ urgencyIcon }}</span>
      <span class="urgency-text">{{ urgencyText }}</span>
    </div>

    <div class="card-content">
      <!-- 1. IMPACT STATEMENT (Priority 1 - Largest, Top) -->
      <h3 class="impact-statement" @click="$emit('ver-detalle')">
        {{ impactStatement }}
      </h3>

      <!-- 2. TYPE + CATEGORY BADGE (Priority 2) -->
      <div class="metadata-row">
        <span :class="['type-badge', `badge-${categoryColor}`]">
          {{ tipoDocumento }}
        </span>
      </div>

      <!-- 3. OFFICIAL TITLE + DATE (Priority 3) -->
      <p class="official-title">
        {{ titulo }}
      </p>

      <!-- 4. ORGANIZATION (Priority 4) -->
      <div v-if="organismo" class="organization">
        <span class="org-icon">🏛️</span>
        <span class="org-name">{{ organismo }}</span>
      </div>

      <!-- 5. IMPORTANT DATE (Priority 5 - Conditional) -->
      <div v-if="fechaImportante" class="important-date">
        <span class="date-icon">📅</span>
        <span class="date-label">{{ fechaImportante.tipo }}:</span>
        <span class="date-value">{{ formatDate(fechaImportante.fecha) }}</span>
        <span v-if="fechaImportante.diasRestantes !== undefined" :class="getDateUrgencyClass(fechaImportante.diasRestantes)">
          ({{ fechaImportante.diasRestantes }} días)
        </span>
      </div>

      <!-- Action buttons -->
      <div class="actions">
        <button
          @click="$emit('ver-detalle')"
          class="btn-primary"
        >
          Ver detalles
        </button>
        <button
          v-if="urlPdf"
          @click.stop="abrirPDF"
          class="btn-secondary"
          title="Abrir PDF oficial del BOE"
        >
          PDF
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface FechaImportante {
  tipo: string
  fecha: string
  descripcion?: string
  diasRestantes?: number
}

interface Props {
  titulo: string
  tipoDocumento?: string
  explicacion?: string
  comoAfecta?: string
  fechaImportante?: FechaImportante
  organismo?: string
  keywords?: string[]
  urlPdf?: string
  fechaPublicacion: string
}

const props = withDefaults(defineProps<Props>(), {
  tipoDocumento: 'Documento BOE',
  keywords: () => []
})

defineEmits(['ver-detalle'])

// ============================================================================
// COMPUTED: Impact Statement (siguiendo pirámide invertida)
// ============================================================================

const impactStatement = computed(() => {
  // Usar comoAfecta si existe (es el más directo)
  if (props.comoAfecta) {
    // Tomar primera oración o primeras 120 caracteres
    const firstSentence = props.comoAfecta.split('.')[0]
    if (firstSentence.length <= 120) {
      return firstSentence + '.'
    }
    return firstSentence.substring(0, 117) + '...'
  }

  // Fallback a explicacion
  if (props.explicacion) {
    const firstSentence = props.explicacion.split('.')[0]
    if (firstSentence.length <= 120) {
      return firstSentence + '.'
    }
    return firstSentence.substring(0, 117) + '...'
  }

  // Fallback al título
  return props.titulo
})

// ============================================================================
// COMPUTED: Urgency Level (para visual indicators)
// ============================================================================

const urgencyLevel = computed(() => {
  if (!props.fechaImportante?.diasRestantes) return null

  const dias = props.fechaImportante.diasRestantes

  if (dias < 0) return 'expired' // Ya pasó
  if (dias <= 7) return 'critical' // Rojo
  if (dias <= 15) return 'urgent' // Naranja
  if (dias <= 30) return 'upcoming' // Amarillo

  return null
})

const urgencyIcon = computed(() => {
  switch (urgencyLevel.value) {
    case 'expired': return '🔴'
    case 'critical': return '⚠️'
    case 'urgent': return '🔔'
    case 'upcoming': return '📌'
    default: return ''
  }
})

const urgencyText = computed(() => {
  if (!props.fechaImportante?.diasRestantes) return ''

  const dias = props.fechaImportante.diasRestantes

  if (dias < 0) return 'Plazo vencido'
  if (dias === 0) return '¡Último día!'
  if (dias === 1) return '¡Mañana!'
  if (dias <= 7) return `¡${dias} días restantes!`
  if (dias <= 15) return `${dias} días restantes`
  if (dias <= 30) return `Próximamente (${dias} días)`

  return ''
})

// ============================================================================
// COMPUTED: Category Color (psicología del color)
// ============================================================================

const categoryColor = computed(() => {
  const tipo = props.tipoDocumento?.toLowerCase() || ''

  // Rojo/Naranja: Urgente, cambios importantes
  if (tipo.includes('decreto') || tipo.includes('ley') || tipo.includes('real decreto')) {
    return 'urgent'
  }

  // Verde: Oportunidades, beneficios
  if (tipo.includes('ayuda') || tipo.includes('subvención') || tipo.includes('beca')) {
    return 'benefit'
  }

  // Naranja: Atención necesaria
  if (tipo.includes('convocatoria') || tipo.includes('concurso') || tipo.includes('oposición')) {
    return 'attention'
  }

  // Azul: Informativo (default)
  return 'info'
})

// ============================================================================
// COMPUTED: Nuevo/Reciente Badge
// ============================================================================

const esNuevo = computed(() => {
  const pubDate = new Date(props.fechaPublicacion)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - pubDate.getTime()) / (1000 * 60 * 60 * 24))
  return diffDays <= 3
})

// ============================================================================
// METHODS
// ============================================================================

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function getDateUrgencyClass(diasRestantes: number): string {
  if (diasRestantes < 0) return 'date-expired'
  if (diasRestantes <= 7) return 'date-critical'
  if (diasRestantes <= 15) return 'date-urgent'
  return 'date-normal'
}

function abrirPDF() {
  if (props.urlPdf) {
    window.open(props.urlPdf, '_blank')
  }
}
</script>

<style scoped>
/* ============================================================================
   CARD WRAPPER - Basado en investigación de white space y shadow
   ============================================================================ */
.card-wrapper {
  position: relative;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  overflow: hidden;
}

.card-wrapper:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #1976d2;
  transform: translateY(-2px);
}

/* ============================================================================
   URGENCY BADGE - Top bar para indicar urgencia
   ============================================================================ */
.urgency-badge {
  display: flex;
  align-items: center;
  gap: 8px; /* 1 unidad del grid de 8px */
  padding: 8px 24px;
  font-size: 13px;
  font-weight: 600;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.urgency-critical {
  background: linear-gradient(135deg, #d32f2f 0%, #c62828 100%);
  color: #ffffff;
}

.urgency-urgent {
  background: linear-gradient(135deg, #f57c00 0%, #ef6c00 100%);
  color: #ffffff;
}

.urgency-upcoming {
  background: linear-gradient(135deg, #fbc02d 0%, #f9a825 100%);
  color: #1a1a1a;
}

.urgency-expired {
  background: #757575;
  color: #ffffff;
}

.urgency-icon {
  font-size: 16px;
}

/* ============================================================================
   CARD CONTENT - Padding basado en grid de 8px (3 unidades = 24px)
   ============================================================================ */
.card-content {
  padding: 24px; /* 3 unidades */
}

/* ============================================================================
   1. IMPACT STATEMENT - Priority 1 (Jerarquía Visual Nivel 1)
   Basado en: Pirámide invertida, F-pattern, Serial position effect
   ============================================================================ */
.impact-statement {
  font-size: 18px; /* Tamaño grande para jerarquía */
  font-weight: 600; /* Semi-bold */
  line-height: 1.5; /* WCAG requirement: 1.5x font size = 27px */
  color: #1a1a1a; /* Near-black, WCAG AAA contrast */
  margin: 0 0 16px 0; /* 2 unidades de spacing */
  cursor: pointer;

  /* Limitar a 2 líneas para Miller's Law (no sobrecargar) */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  transition: color 0.2s ease;
}

.impact-statement:hover {
  color: #1976d2; /* Blue on hover */
}

/* ============================================================================
   2. METADATA ROW - Type badge + category
   ============================================================================ */
.metadata-row {
  display: flex;
  align-items: center;
  gap: 8px; /* 1 unidad */
  margin-bottom: 16px; /* 2 unidades */
}

.type-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
}

/* Colores basados en psicología del color */
.badge-urgent {
  background: rgba(211, 47, 47, 0.1); /* 10% opacity red */
  color: #c62828;
}

.badge-benefit {
  background: rgba(56, 142, 60, 0.1); /* 10% opacity green */
  color: #2e7d32;
}

.badge-attention {
  background: rgba(245, 124, 0, 0.1); /* 10% opacity orange */
  color: #e65100;
}

.badge-info {
  background: rgba(25, 118, 210, 0.1); /* 10% opacity blue */
  color: #1565c0;
}

/* ============================================================================
   3. OFFICIAL TITLE - Priority 3 (Jerarquía Visual Nivel 2)
   ============================================================================ */
.official-title {
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5; /* 21px */
  color: #4a4a4a; /* Dark gray, WCAG AA */
  margin: 0 0 16px 0; /* 2 unidades */

  /* Limitar a 2 líneas */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ============================================================================
   4. ORGANIZATION - Priority 4 (Jerarquía Visual Nivel 3)
   ============================================================================ */
.organization {
  display: flex;
  align-items: center;
  gap: 8px; /* 1 unidad */
  margin-bottom: 16px; /* 2 unidades */
  font-size: 13px;
  color: #666666; /* Medium gray, WCAG AA at 13px+ */
}

.org-icon {
  font-size: 14px;
}

.org-name {
  font-weight: 400;
  line-height: 1.5;
}

/* ============================================================================
   5. IMPORTANT DATE - Priority 5 (Conditional)
   ============================================================================ */
.important-date {
  display: flex;
  align-items: center;
  gap: 8px; /* 1 unidad */
  margin-bottom: 16px; /* 2 unidades */
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
}

.date-icon {
  font-size: 16px;
}

.date-label {
  color: #666666;
}

.date-value {
  color: #1a1a1a;
  font-weight: 500;
}

/* Date urgency colors - Basado en psicología del color */
.date-critical {
  color: #d32f2f; /* Red */
  font-weight: 700;
}

.date-urgent {
  color: #f57c00; /* Orange */
  font-weight: 600;
}

.date-normal {
  color: #666666;
}

.date-expired {
  color: #757575;
  text-decoration: line-through;
}

/* ============================================================================
   ACTIONS - Buttons
   ============================================================================ */
.actions {
  display: flex;
  gap: 8px; /* 1 unidad */
  margin-top: 24px; /* 3 unidades - separación generosa */
  padding-top: 16px; /* 2 unidades */
  border-top: 1px solid #e0e0e0;
}

.btn-primary {
  flex: 1;
  padding: 12px 20px;
  background: #1976d2; /* Blue - trust */
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  /* WCAG - Touch target mínimo 44x44px */
  min-height: 44px;
}

.btn-primary:hover {
  background: #1565c0;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.3);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-secondary {
  padding: 12px 20px;
  background: #f5f5f5;
  color: #1a1a1a;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  min-height: 44px;
}

.btn-secondary:hover {
  background: #e0e0e0;
  border-color: #bdbdbd;
}

/* ============================================================================
   RESPONSIVE - Mobile First (< 768px)
   Basado en: 63.4% del tráfico es móvil
   ============================================================================ */
@media (max-width: 768px) {
  .card-content {
    padding: 16px; /* Reducido de 24px */
  }

  .impact-statement {
    font-size: 16px; /* Reducido de 18px */
    line-height: 1.5; /* 24px */
  }

  .official-title {
    font-size: 13px; /* Reducido de 14px */
  }

  .actions {
    flex-direction: column;
  }

  .btn-secondary {
    width: 100%;
  }
}

/* ============================================================================
   ACCESSIBILITY - Focus states
   ============================================================================ */
.card-wrapper:focus-within {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
}

button:focus-visible {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
}

/* ============================================================================
   PRINT STYLES
   ============================================================================ */
@media print {
  .card-wrapper {
    box-shadow: none;
    border: 1px solid #000;
    break-inside: avoid;
  }

  .actions {
    display: none;
  }
}
</style>
