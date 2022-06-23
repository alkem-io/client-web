import * as Sentry from '@sentry/react';

// Sentry severity levels - See @sentry/types/types/severity.d.ts
const debugLevel: Sentry.SeverityLevel = 'debug';
const infoLevel: Sentry.SeverityLevel = 'info';
const logLevel: Sentry.SeverityLevel = 'log';
const warningLevel: Sentry.SeverityLevel = 'warning';
const errorLevel: Sentry.SeverityLevel = 'error';
const fatalLevel: Sentry.SeverityLevel = 'fatal';

export const error = (
  error: Error,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setup: (scope: Sentry.Scope) => void = () => {},
  severity: typeof fatalLevel | typeof errorLevel = errorLevel
) => {
  Sentry.withScope(scope => {
    scope.setLevel(severity);
    setup(scope);
    Sentry.captureException(error);
  });
};

export const warn = (warning: string) => {
  Sentry.withScope(scope => {
    scope.setLevel(warningLevel);
    Sentry.captureEvent({ message: warning });
  });
};

export const info = (
  message: string, 
  severity: typeof debugLevel | typeof infoLevel | typeof logLevel = infoLevel
) => {
  Sentry.withScope(scope => {
    scope.setLevel(severity);
    Sentry.captureMessage(message);
  });
};
