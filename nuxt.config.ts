// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  colorMode: {
    preference: 'light'
  },
  devtools: { enabled: true },
/*   dayjs: {
    locales: ['es'],
    plugins: ['advancedFormat', 'weekOfYear', 'isoWeek', 'weekday', 'utc', 'isBetween', 'isSameOrBefore', 'updateLocale'],
    defaultLocale: 'es',
  }, */
  modules: ['@nuxt/ui','@pinia/nuxt',"@pinia-plugin-persistedstate/nuxt"]
})