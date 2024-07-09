import * as Sentry from '@sentry/react';

export enum TagCategoryValues {
  SERVER = 'SERVER',
  AUTH = 'AUTH',
  UI = 'UI',
  WHITEBOARD = 'WHITEBOARD',
  CONFIG = 'CONFIG',
  SPACE_CREATION = 'SPACE_CREATION',
  WS = 'WS',
}

interface Tags {
  category?: TagCategoryValues;
  label?: string;
  code?: string;
}

const setTags = (tags: Tags, scope: Sentry.Scope) => {
  for (const [key, value] of Object.entries(tags)) {
    if (value) {
      scope.setTag(key.toUpperCase(), value);
    }
  }
};

const getLogTypeBySeverity = (severity: Sentry.SeverityLevel) => {
  switch (severity) {
    case 'error':
      return 'error';
    case 'warning':
      return 'warn';
    case 'info':
      return 'info';
    default:
      return 'log';
  }
};

const consoleLog = (severity: Sentry.SeverityLevel, error: Error | string, tags?: Tags) => {
  console[getLogTypeBySeverity(severity)]?.('[Sentry Log] ', error, tags);
};

const log = (severity: Sentry.SeverityLevel) => (error: Error | string, tags?: Tags) => {
  const isDevelopment = import.meta.env.MODE === 'development';
  isDevelopment && consoleLog(severity, error, tags);

  return Sentry.withScope(scope => {
    scope.setLevel(severity);
    tags && setTags(tags, scope);
    if (typeof error === 'string') {
      Sentry.captureMessage(error);
    } else {
      Sentry.captureException(error);
    }
  });
};

export const error = log('error');

export const warn = log('warning');

export const info = log('info');

export const log404NotFound = () => {
  Sentry.withScope(scope => {
    scope.setLevel('error');
    const message = `404: '${document.location.href}'`;
    Sentry.captureEvent({ message, extra: { url: document.location.href, referrer: document.referrer } });
  });
};
