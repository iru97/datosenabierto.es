<template>
  <li class="group">
    <div class="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
      <DocumentTextIcon class="h-5 w-5 text-gray-400 mt-1" />
      <div class="flex-1">
        <p class="text-sm text-gray-700">{{ item.titulo }}</p>
        <div class="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <a
            :href="item.url_pdf"
            target="_blank"
            class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            title="Ver PDF"
            rel="noopener noreferrer"
          >
            <DocumentArrowDownIcon class="h-4 w-4 text-red-500" />
            PDF
          </a>
          <a
            :href="item.url_html"
            target="_blank"
            class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            title="Ver HTML"
            rel="noopener noreferrer"
          >
            <CodeBracketIcon class="h-4 w-4 text-blue-500" />
            HTML
          </a>
          <a
            :href="item.url_xml"
            target="_blank"
            class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            title="Ver XML"
            rel="noopener noreferrer"
          >
            <CommandLineIcon class="h-4 w-4 text-green-500" />
            XML
          </a>
        </div>
      </div>
    </div>
  </li>
</template>

<script setup lang="ts">
import {
  DocumentTextIcon,
  DocumentArrowDownIcon,
  CodeBracketIcon,
  CommandLineIcon
} from '@heroicons/vue/24/outline'
import type { BOEItem as BOEItemType } from '~/types/boe'

defineProps<{
  item: BOEItemType
}>()
</script>