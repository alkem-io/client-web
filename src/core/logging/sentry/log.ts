import * as Sentry from '@sentry/react';

export enum TagCategoryValues {
  SERVER = 'SERVER',
  AUTH = 'AUTH',
  UI = 'UI',
  WHITEBOARD = 'WHITEBOARD',
  CONFIG = 'CONFIG',
}

interface Tags {
  category?: TagCategoryValues;
  label?: string;
}

const setTags = (tags: Tags, scope: Sentry.Scope) => {
  for (const [key, value] of Object.entries(tags)) {
    scope.setTag(key.toUpperCase(), value);
  }
};

const log = (severity: Sentry.SeverityLevel) => (error: Error | string, tags?: Tags) =>
  Sentry.withScope(scope => {
    scope.setLevel(severity);
    tags && setTags(tags, scope);
    if (typeof error === 'string') {
      Sentry.captureMessage(error);
    } else {
      Sentry.captureException(error);
    }
  });

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
