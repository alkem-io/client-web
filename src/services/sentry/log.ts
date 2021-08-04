import * as Sentry from '@sentry/react';

export const error = (
  error: Error,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setup: (scope: Sentry.Scope) => void = () => {},
  severity: Sentry.Severity.Critical | Sentry.Severity.Fatal | Sentry.Severity.Error = Sentry.Severity.Error
) => {
  Sentry.withScope(scope => {
    scope.setLevel(severity);
    setup(scope);
    Sentry.captureException(error);
  });
};

export const warn = (warning: string) => {
  Sentry.withScope(scope => {
    scope.setLevel(Sentry.Severity.Warning);
    Sentry.captureEvent({ message: warning });
  });
};

export const info = (
  message: string,
  severity: Sentry.Severity.Info | Sentry.Severity.Log | Sentry.Severity.Debug = Sentry.Severity.Info
) => {
  Sentry.withScope(scope => {
    scope.setLevel(severity);
    Sentry.captureMessage(message);
  });
};
