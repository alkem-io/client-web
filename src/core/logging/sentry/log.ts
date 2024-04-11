import * as Sentry from '@sentry/react';

// Sentry severity levels - See @sentry/types/types/severity.d.ts
const debugLevel: Sentry.SeverityLevel = 'debug';
const infoLevel: Sentry.SeverityLevel = 'info';
const logLevel: Sentry.SeverityLevel = 'log';
const warningLevel: Sentry.SeverityLevel = 'warning';
const errorLevel: Sentry.SeverityLevel = 'error';
const fatalLevel: Sentry.SeverityLevel = 'fatal';

export const tagKeys = {
  CATEGORY: 'CATEGORY',
  LABEL: 'LABEL',
} as const;

export const tagCategoryValues = {
  SERVER: 'SERVER',
  AUTH: 'AUTH',
  UI: 'UI',
  WHITEBOARD: 'WHITEBOARD',
} as const;

type TagsKeysType = keyof typeof tagKeys;
type TagType = {
  [key in TagsKeysType]?: string;
};

const setTags = (tags: TagType, scope: Sentry.Scope) => {
  for (const [key, value] of Object.entries(tags)) {
    scope.setTag(key, value);
  }
};

export const error = (
  error: Error,
  tags?: TagType | undefined,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setup: (scope: Sentry.Scope) => void = () => {},
  severity: typeof fatalLevel | typeof errorLevel = errorLevel
) => {
  Sentry.withScope(scope => {
    scope.setLevel(severity);
    tags && setTags(tags, scope);
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

export const info = (message: string, severity: typeof debugLevel | typeof infoLevel | typeof logLevel = infoLevel) => {
  Sentry.withScope(scope => {
    scope.setLevel(severity);
    Sentry.captureMessage(message);
  });
};

export const log404NotFound = () => {
  Sentry.withScope(scope => {
    scope.setLevel(errorLevel);
    const message = `404: '${document.location.href}'`;
    Sentry.captureEvent({ message, extra: { url: document.location.href, referrer: document.referrer } });
  });
};
