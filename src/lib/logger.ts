import pino from 'pino'

const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  base: {
    env: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    service: 'verdict-api',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label }),
  },
})

// Request-scoped child logger with correlation ID
export function createRequestLogger(requestId: string, route: string) {
  return logger.child({
    requestId,
    route,
  })
}

export type Logger = typeof logger
