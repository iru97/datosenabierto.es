import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('tooltip', {
    mounted: (el, binding) => {
      el.setAttribute('title', binding.value)
      el.classList.add('cursor-help')
    },
    updated: (el, binding) => {
      el.setAttribute('title', binding.value)
    }
  })
})