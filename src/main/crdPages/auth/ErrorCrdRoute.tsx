import { useEffect, useState } from 'react';
import { useTransactionScope } from '@/core/analytics/SentryTransactionScopeContext';
import { useKratosClient } from '@/core/auth/authentication/hooks/useKratosClient';
import { useQueryParams } from '@/core/routing/useQueryParams';
import { ErrorCard } from '@/crd/components/auth/ErrorCard';
import { buildLoginUrl } from '@/main/routing/urlBuilders';
import { AuthShellWrapper } from './AuthShellWrapper';

type ResolvedError = {
  loading: boolean;
  code?: string;
  message?: string;
  reason?: string;
};

/**
 * CRD `/error` route — the un-gated replacement for the MUI `ErrorRoute`.
 * Resolves the Kratos error referenced by the `?id=` query parameter.
 */
export function ErrorCrdRoute() {
  useTransactionScope({ type: 'authentication' });

  const client = useKratosClient();
  const errorId = useQueryParams().get('id') ?? undefined;
  const [resolved, setResolved] = useState<ResolvedError>({ loading: true });

  useEffect(() => {
    if (!client || !errorId) {
      setResolved({ loading: false });
      return;
    }
    let active = true;
    client
      .getFlowError({ id: errorId })
      .then(response => {
        if (!active) {
          return;
        }
        const error = response.data.error as { code?: number | string; message?: string; reason?: string } | undefined;
        setResolved({
          loading: false,
          code: error?.code == null ? undefined : String(error.code),
          message: error?.message,
          reason: error?.reason,
        });
      })
      .catch(() => {
        if (active) {
          setResolved({ loading: false });
        }
      });
    return () => {
      active = false;
    };
  }, [client, errorId]);

  return (
    <AuthShellWrapper>
      <ErrorCard
        isLoading={resolved.loading}
        errorCode={resolved.code}
        errorMessage={resolved.message}
        errorReason={resolved.reason}
        signInHref={buildLoginUrl()}
      />
    </AuthShellWrapper>
  );
}
