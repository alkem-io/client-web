import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { log404NotFound } from '@/core/logging/sentry/log';
import useNavigate from '@/core/routing/useNavigate';
import { usePageTitle } from '@/core/routing/usePageTitle';
import { CrdNotFoundPage } from '@/crd/components/error/CrdNotFoundPage';
import { hasInAppHistory } from '@/main/crdPages/error/hasInAppHistory';
import { TopLevelRoutePath } from '@/main/routing/TopLevelRoutePath';

/**
 * Layout-less CRD "page not found" body — wires {@link CrdNotFoundPage} to
 * routing, i18n, page-title, and the Sentry 404 log. Render this when the host
 * already provides a layout (it is mounted inside a `CrdLayoutWrapper` route or
 * page). For the standalone 404 route that owns its own layout, use
 * `CrdNotFoundBranch`, which wraps this view in `CrdLayoutWrapper`.
 */
export function CrdNotFoundView() {
  const { t } = useTranslation('crd-error');
  const navigate = useNavigate();
  const showGoBack = hasInAppHistory();

  usePageTitle(t('notFound.title'));

  useEffect(() => {
    log404NotFound();
  }, []);

  return (
    <CrdNotFoundPage
      title={t('notFound.title')}
      description={t('notFound.description')}
      goHomeLabel={t('notFound.actions.goHome')}
      goBackLabel={t('notFound.actions.goBack')}
      onGoHome={() => navigate(`/${TopLevelRoutePath.Home}`)}
      onGoBack={showGoBack ? () => navigate(-1) : undefined}
      showGoBack={showGoBack}
    />
  );
}
