<template>
  <div class="multi-category-badges">
    <!-- Primary category (always shown) -->
    <span
      v-if="primaryCategoria"
      :class="['category-badge', 'primary', `cat-${primaryCategoria.slug}`]"
      :title="`Categoría principal (${Math.round(primaryCategoria.confidence * 100)}% confianza)`"
    >
      {{ primaryCategoria.nombre }}
      <span v-if="showConfidence" class="confidence-indicator">
        {{ Math.round(primaryCategoria.confidence * 100) }}%
      </span>
    </span>

    <!-- Secondary categories (shown based on maxVisible) -->
    <template v-if="secondaryCategorias.length > 0">
      <span
        v-for="(cat, index) in visibleSecondaryCategorias"
        :key="cat.categoria_id"
        :class="['category-badge', 'secondary', `cat-${cat.slug}`]"
        :title="`${Math.round(cat.confidence * 100)}% confianza`"
      >
        {{ cat.nombre }}
        <span v-if="showConfidence" class="confidence-indicator">
          {{ Math.round(cat.confidence * 100) }}%
        </span>
      </span>

      <!-- "More" indicator if there are hidden categories -->
      <span
        v-if="hiddenCount > 0"
        class="category-badge more-indicator"
        :title="hiddenCategoriesText"
        @click="showAllCategories"
      >
        +{{ hiddenCount }}
      </span>
    </template>

    <!-- Method indicator (for admin/debug) -->
    <span
      v-if="showMethod && primaryCategoria"
      class="method-badge"
      :title="`Clasificado por: ${getMethodLabel(primaryCategoria.metodo)}`"
    >
      {{ getMethodIcon(primaryCategoria.metodo) }}
    </span>
  </div>
</template>

<script setup lang="ts">
interface Categoria {
  categoria_id: string
  categoria_slug: string
  categoria_nombre: string
  confidence: number
  metodo: 'rule' | 'keyword' | 'llm' | 'legacy'
}

interface Props {
  categorias: Categoria[]
  maxVisible?: number // Max secondary categories to show
  showConfidence?: boolean // Show confidence percentage
  showMethod?: boolean // Show classification method (for admin)
}

const props = withDefaults(defineProps<Props>(), {
  maxVisible: 2,
  showConfidence: false,
  showMethod: false
})

// Computed properties
const primaryCategoria = computed(() => {
  // Primary = highest confidence
  if (!props.categorias || props.categorias.length === 0) return null

  return {
    ...props.categorias[0],
    slug: props.categorias[0].categoria_slug,
    nombre: props.categorias[0].categoria_nombre
  }
})

const secondaryCategorias = computed(() => {
  if (!props.categorias || props.categorias.length <= 1) return []

  return props.categorias.slice(1).map(cat => ({
    ...cat,
    slug: cat.categoria_slug,
    nombre: cat.categoria_nombre
  }))
})

const showAll = ref(false)

const visibleSecondaryCategorias = computed(() => {
  if (showAll.value) return secondaryCategorias.value

  return secondaryCategorias.value.slice(0, props.maxVisible)
})

const hiddenCount = computed(() => {
  if (showAll.value) return 0

  return Math.max(0, secondaryCategorias.value.length - props.maxVisible)
})

const hiddenCategoriesText = computed(() => {
  if (hiddenCount.value === 0) return ''

  const hidden = secondaryCategorias.value.slice(props.maxVisible)
  return hidden.map(c => c.nombre).join(', ')
})

// Methods
function showAllCategories() {
  showAll.value = !showAll.value
}

function getMethodIcon(metodo: string): string {
  const icons = {
    rule: '📋', // Deterministic rules
    keyword: '🔍', // Keyword matching
    llm: '🤖', // AI classification
    legacy: '📦' // Migrated data
  }
  return icons[metodo as keyof typeof icons] || '❓'
}

function getMethodLabel(metodo: string): string {
  const labels = {
    rule: 'Reglas deterministas',
    keyword: 'Palabras clave',
    llm: 'Inteligencia Artificial',
    legacy: 'Clasificación heredada'
  }
  return labels[metodo as keyof typeof labels] || 'Desconocido'
}
</script>

<style scoped>
.multi-category-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.category-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
  transition: all 0.2s ease;
  cursor: default;
}

/* Primary category - more prominent */
.category-badge.primary {
  padding: 6px 14px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Secondary categories - subtle */
.category-badge.secondary {
  opacity: 0.85;
  font-weight: 500;
}

.category-badge.secondary:hover {
  opacity: 1;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Confidence indicator */
.confidence-indicator {
  font-size: 11px;
  opacity: 0.8;
  font-weight: 400;
}

/* More indicator */
.more-indicator {
  background: #e0e0e0;
  color: #666;
  cursor: pointer;
  font-weight: 600;
}

.more-indicator:hover {
  background: #d0d0d0;
  transform: scale(1.05);
}

/* Method badge (admin only) */
.method-badge {
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 12px;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  cursor: help;
}

/* Category-specific colors (based on your existing design) */
.cat-oposiciones {
  background: rgba(33, 150, 243, 0.1);
  color: #1565c0;
  border: 1px solid rgba(33, 150, 243, 0.3);
}

.cat-ayudas {
  background: rgba(76, 175, 80, 0.1);
  color: #2e7d32;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.cat-legislacion {
  background: rgba(156, 39, 176, 0.1);
  color: #6a1b9a;
  border: 1px solid rgba(156, 39, 176, 0.3);
}

.cat-nombramientos {
  background: rgba(255, 152, 0, 0.1);
  color: #ef6c00;
  border: 1px solid rgba(255, 152, 0, 0.3);
}

.cat-licitaciones {
  background: rgba(233, 30, 99, 0.1);
  color: #c2185b;
  border: 1px solid rgba(233, 30, 99, 0.3);
}

.cat-educacion {
  background: rgba(3, 169, 244, 0.1);
  color: #0277bd;
  border: 1px solid rgba(3, 169, 244, 0.3);
}

.cat-vivienda {
  background: rgba(121, 85, 72, 0.1);
  color: #5d4037;
  border: 1px solid rgba(121, 85, 72, 0.3);
}

.cat-empleo {
  background: rgba(255, 193, 7, 0.1);
  color: #f57c00;
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.cat-medio-ambiente {
  background: rgba(67, 160, 71, 0.1);
  color: #2e7d32;
  border: 1px solid rgba(67, 160, 71, 0.3);
}

.cat-trafico {
  background: rgba(244, 67, 54, 0.1);
  color: #c62828;
  border: 1px solid rgba(244, 67, 54, 0.3);
}

.cat-salud {
  background: rgba(229, 57, 53, 0.1);
  color: #c62828;
  border: 1px solid rgba(229, 57, 53, 0.3);
}

.cat-tecnologia {
  background: rgba(96, 125, 139, 0.1);
  color: #455a64;
  border: 1px solid rgba(96, 125, 139, 0.3);
}

/* Responsive */
@media (max-width: 640px) {
  .category-badge {
    font-size: 12px;
    padding: 3px 10px;
  }

  .category-badge.primary {
    font-size: 13px;
    padding: 5px 12px;
  }

  .confidence-indicator {
    font-size: 10px;
  }
}
</style>
