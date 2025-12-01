import * as Sentry from '@sentry/react';
import { getNavigationHistory } from '@/core/routing/NavigationHistory';

export const enum TagCategoryValues {
  SERVER = 'SERVER',
  AUTH = 'AUTH',
  UI = 'UI',
  WHITEBOARD = 'WHITEBOARD',
  MEMO = 'MEMO',
  CONFIG = 'CONFIG',
  SPACE_CREATION = 'SPACE_CREATION',
  WS = 'WS',
  VC = 'VC',
  NOTIFICATIONS = 'NOTIFICATIONS',
}

interface Tags {
  category?: TagCategoryValues;
  label?: string;
  code?: string;
}

const isDevelopment = import.meta.env.MODE === 'development';

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
  const severity = 'error';
  const currentURL = document.location.href;
  const referrer = document.referrer;
  const history = getNavigationHistory();
  const message = `404: url: '${currentURL}', referrer: '${referrer}'`;
  const tags = { code: '404' };

  isDevelopment && consoleLog(severity, message, tags);

  Sentry.withScope(scope => {
    scope.setLevel(severity);
    setTags(tags, scope);
    Sentry.captureEvent({ message, extra: { url: currentURL, referrer: referrer, history } });
  });
};
