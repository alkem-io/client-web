import { UserModel } from '@/domain/community/user/models/UserModel';
import * as Sentry from '@sentry/react';

export const setUserScope = (user: UserModel | undefined, piiEnabled?: boolean) => {
  if (user && piiEnabled) {
    Sentry.setUser({ id: user.id, username: user.profile.displayName, email: user.email });
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
