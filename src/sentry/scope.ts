import * as Sentry from '@sentry/react';
import { env } from '../env';
import { User } from '../types/graphql-schema';

const piiEnabled = env && env.REACT_APP_SENTRY_PII_ENABLED;

export const setUserScope = (user: User | undefined) => {
  if (user && piiEnabled) {
    Sentry.setUser({ id: user.id, username: user.displayName, email: user.email });
  } else {
    Sentry.configureScope(scope => scope.setUser(null));
  }
};

export interface TransactionScope {
  type: 'admin' | 'authentication' | 'connect(search)' | 'domain';
}

export const setTransactionScope = (tScope: TransactionScope) => {
  Sentry.configureScope(scope => scope.setTransactionName(tScope.type));
};
