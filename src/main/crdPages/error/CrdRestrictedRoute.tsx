import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useTransactionScope } from '@/core/analytics/SentryTransactionScopeContext';
import { info as logInfo } from '@/core/logging/sentry/log';
import useNavigate from '@/core/routing/useNavigate';
import { usePageTitle } from '@/core/routing/usePageTitle';
import { useQueryParams } from '@/core/routing/useQueryParams';
import { CrdForbiddenPage } from '@/crd/components/error/CrdForbiddenPage';
import { hasInAppHistory } from '@/main/crdPages/error/hasInAppHistory';
import { TopLevelRoutePath } from '@/main/routing/TopLevelRoutePath';
import { CrdLayoutWrapper } from '@/main/ui/layout/CrdLayoutWrapper';

export function CrdRestrictedRoute() {
  useTransactionScope({ type: 'authentication' });

  const params = useQueryParams();
  const origin = params.get('origin');

  useEffect(() => {
    logInfo(`Attempted access to: ${origin}`);
  }, [origin]);

  const { t } = useTranslation('crd-error');
  const navigate = useNavigate();
  const showGoBack = hasInAppHistory();

  usePageTitle(t('forbidden.title'));

  return (
    <CrdLayoutWrapper>
      <CrdForbiddenPage
        title={t('forbidden.title')}
        description={t('forbidden.description')}
        goHomeLabel={t('forbidden.actions.goHome')}
        goBackLabel={t('forbidden.actions.goBack')}
        onGoHome={() => navigate(`/${TopLevelRoutePath.Home}`)}
        onGoBack={showGoBack ? () => navigate(-1) : undefined}
        showGoBack={showGoBack}
      />
    </CrdLayoutWrapper>
  );
}
