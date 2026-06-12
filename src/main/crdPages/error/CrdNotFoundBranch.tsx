import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { log404NotFound } from '@/core/logging/sentry/log';
import useNavigate from '@/core/routing/useNavigate';
import { usePageTitle } from '@/core/routing/usePageTitle';
import { CrdNotFoundPage } from '@/crd/components/error/CrdNotFoundPage';
import { hasInAppHistory } from '@/main/crdPages/error/hasInAppHistory';
import { TopLevelRoutePath } from '@/main/routing/TopLevelRoutePath';
import { CrdLayoutWrapper } from '@/main/ui/layout/CrdLayoutWrapper';

export function CrdNotFoundBranch() {
  const { t } = useTranslation('crd-error');
  const navigate = useNavigate();
  const showGoBack = hasInAppHistory();

  usePageTitle(t('notFound.title'));

  useEffect(() => {
    log404NotFound();
  }, []);

  return (
    <CrdLayoutWrapper>
      <CrdNotFoundPage
        title={t('notFound.title')}
        description={t('notFound.description')}
        goHomeLabel={t('notFound.actions.goHome')}
        goBackLabel={t('notFound.actions.goBack')}
        onGoHome={() => navigate(`/${TopLevelRoutePath.Home}`)}
        onGoBack={showGoBack ? () => navigate(-1) : undefined}
        showGoBack={showGoBack}
      />
    </CrdLayoutWrapper>
  );
}
