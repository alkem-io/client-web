import * as Sentry from '@sentry/react';

export const error = (
  error: Error,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setup: (scope: Sentry.Scope) => void = () => {},
  severity: 'fatal' | 'error' = 'error'
) => {
  Sentry.withScope(scope => {
    scope.setLevel(severity);
    setup(scope);
    Sentry.captureException(error);
  });
};

export const warn = (warning: string) => {
  Sentry.withScope(scope => {
    scope.setLevel('warning');
    Sentry.captureEvent({ message: warning });
  });
};

export const info = (message: string, severity: 'info' | 'log' | 'debug' = 'info') => {
  Sentry.withScope(scope => {
    scope.setLevel(severity);
    Sentry.captureMessage(message);
  });
};
