import Vue from 'vue'
import VueRouter from 'vue-router'
import * as Sentry from "@sentry/vue";
import { BrowserTracing } from "@sentry/tracing";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const sentryConfig = (router: VueRouter) => Sentry.init({
  Vue,
  dsn: process.env.VUE_APP_SENTRY_DSN || '',
  integrations: [
    new BrowserTracing({
      routingInstrumentation: Sentry.vueRouterInstrumentation(router)
    })
  ],
  tracesSampleRate: 1.0
});
export default sentryConfig
