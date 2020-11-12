import * as Sentry from '@sentry/react';
import { User } from '../generated/graphql';

export const setUserScope = (user: User | undefined) => {
  if (user) {
    Sentry.setUser({ id: user.id, username: user.name, email: user.email });
  } else {
    Sentry.configureScope(scope => scope.setUser(null));
  }
};
