const cacheTTL = 60 * 60 * 24 * 365;

export default defineNuxtConfig({
  devtools: { enabled: true },
  app: {
    head: {
      link: [
        { rel: 'icon', href: '/favicon.ico' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/icon?family=Material+Icons',
        },
      ],
    },
  },
  css: ['@/assets/main.css'],
  nitro: {
    compressPublicAssets: true,
    routeRules: {
      '/img/**': { headers: { 'cache-control': `public,max-age=${cacheTTL},s-maxage=${cacheTTL}` } },
      '/_nuxt/**': { headers: { 'cache-control': `public,max-age=${cacheTTL},s-maxage=${cacheTTL}` } },
    },
  },
  modules: ['@nuxtjs/supabase'],
  supabase: {
    url: process.env.NUXT_PUBLIC_SUPABASE_URL,
    key: process.env.NUXT_PUBLIC_SUPABASE_KEY,
    redirect: false,
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
    },
    cookieOptions: {
      maxAge: 60 * 60 * 8,
      secure: true,
    },
  },
  typescript: {
    strict: true,
  },
});
