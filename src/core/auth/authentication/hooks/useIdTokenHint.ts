import { useState } from 'react';
import { useIdTokenHintUrl } from '@/core/auth/authentication/hooks/useIdTokenHintUrl';

type IdTokenHintResponse = {
  id_token: string;
};

type UseIdTokenHint = {
  idToken: string | undefined;
  error: Error | undefined;
  loading: boolean;
  fetchIdTokenHint: () => Promise<string>;
};

export const useIdTokenHint = (): UseIdTokenHint => {
  const [idToken, setIdToken] = useState<string>();
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState<boolean>(false);
  const idTokenHintUrl = useIdTokenHintUrl();

  const fetchIdTokenHint = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const response = await fetch(idTokenHintUrl, {
        credentials: 'include',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`id-token-hint request failed with status ${response.status}`);
      }
      const payload = (await response.json()) as IdTokenHintResponse;
      if (!payload?.id_token) {
        throw new Error('id-token-hint response missing id_token');
      }
      setIdToken(payload.id_token);
      return payload.id_token;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { idToken, error, loading, fetchIdTokenHint };
};
