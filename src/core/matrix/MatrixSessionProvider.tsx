import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMatch } from 'react-router-dom';
import { AUTH_LOGOUT_PATH } from '@/core/auth/authentication/constants/authentication.constants';
import { useNativeFoundation } from '@/core/foundation/NativeFoundationProvider';
import { setSessionEstablishing, useMatrixClient } from './activeClient';
import { establishSession } from './sessionController';

export function MatrixSession({ sessionBaseUrl }: { sessionBaseUrl: string }) {
  const { data } = useNativeFoundation();
  const loggingOut = useMatch(AUTH_LOGOUT_PATH);
  const access = !loggingOut && data?.viewer.session.authenticated ? data.viewer.matrix : undefined;
  const { userId, expiresAt, sessionBaseUrl: issuedEndpoint } = access ?? {};
  const [failed, setFailed] = useState(false);
  const client = useMatrixClient();
  const { t } = useTranslation('crd-common');

  useEffect(() => {
    if (!userId || !expiresAt || !issuedEndpoint || !sessionBaseUrl) return;
    const lifetime = new AbortController();
    setFailed(false);
    void establishSession(sessionBaseUrl, { userId, expiresAt, sessionBaseUrl: issuedEndpoint }, lifetime.signal)
      .then(() => {
        if (!lifetime.signal.aborted) setFailed(true);
      })
      .catch(() => {
        if (!lifetime.signal.aborted) setFailed(true);
      });
    return () => {
      lifetime.abort();
      setSessionEstablishing(false);
    };
  }, [userId, expiresAt, issuedEndpoint, sessionBaseUrl]);

  return !client && access && failed ? <p role="alert">{t('apollo.errors.generic')}</p> : null;
}
