import { setupCalendar } from 'v-calendar'
import 'v-calendar/style.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(setupCalendar, {
    locales: {
      'es': {
        firstDayOfWeek: 1,
        masks: {
          input: 'DD/MM/YYYY'
        }
      }
    }
  })
})