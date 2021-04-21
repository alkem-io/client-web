import * as Sentry from '@sentry/react';
import { User } from '../types/graphql-schema';
import { env } from '../env';

const piiEnabled = env && env.REACT_APP_SENTRY_PII_ENABLED;

export const setUserScope = (user: User | undefined) => {
  if (user && piiEnabled) {
    Sentry.setUser({ id: user.id, username: user.name, email: user.email });
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
