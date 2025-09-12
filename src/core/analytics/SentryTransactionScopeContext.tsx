import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useRef } from 'react';
import { setUserScope, setTransactionScope, TransactionScope } from '@/core/logging/sentry/scope';
import { useConfig } from '@/domain/platform/config/useConfig';
import { isEqual, last } from 'lodash';
import { UserModel } from '@/domain/community/user/models/UserModel';

export const useUserScope = (currentUser: UserModel | undefined) => {
  const { sentry } = useConfig();

  useEffect(() => {
    setUserScope(currentUser, sentry?.submitPII);
  }, [currentUser, sentry?.submitPII]);
};

interface TransactionScopeStack {
  push: (scope: TransactionScope) => void;
  pop: (scope: TransactionScope) => void;
}

const TransactionScopeContext = createContext<TransactionScopeStack | undefined>(undefined);

export const SentryTransactionScopeContextProvider = ({ children }: PropsWithChildren) => {
  const transactionScopeStack = useRef<TransactionScope[]>([]).current;

  const isCurrentScope = (scope: TransactionScope) => isEqual(last(transactionScopeStack), scope);

  const push = (scope: TransactionScope) => {
    if (isCurrentScope(scope)) {
      return;
    }
    transactionScopeStack.push(scope);
    setTransactionScope(scope);
  };

  const pop = (scope: TransactionScope) => {
    if (isCurrentScope(scope)) {
      transactionScopeStack.pop();
      const prevScope = last(transactionScopeStack);
      if (prevScope) {
        setTransactionScope(prevScope);
      }
    }
  };

  const api = useMemo<TransactionScopeStack>(() => ({ push, pop }), []);

  return <TransactionScopeContext value={api}>{children}</TransactionScopeContext>;
};

interface UseTransactionScopeOptions {
  skip?: boolean;
}

export const useTransactionScope = (scope: TransactionScope, { skip = false }: UseTransactionScopeOptions = {}) => {
  const transactionScopes = useContext(TransactionScopeContext);

  if (!transactionScopes) {
    throw new Error('Must be within SentryTransactionScopeContextProvider');
  }

  useEffect(() => {
    if (skip) {
      return;
    }

    transactionScopes.push(scope);

    return () => {
      transactionScopes.pop(scope);
    };
  }, [scope, skip]);
};
