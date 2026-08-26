import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === 'production',
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true, // Privacy — mask user input
      blockAllMedia: false,
    }),
  ],
  beforeSend(event) {
    // Strip any PII before sending to Sentry
    if (event.user) {
      delete event.user.email
      delete event.user.username
    }
    return event
  },
})
