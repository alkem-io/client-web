import { useTranslation } from 'react-i18next';

import { Error40X } from '@/core/pages/Errors/Error40X';
import useNavigate from '@/core/routing/useNavigate';
import { usePageTitle } from '@/core/routing/usePageTitle';
import { CrdForbiddenPage } from '@/crd/components/error/CrdForbiddenPage';
import { hasInAppHistory } from '@/main/crdPages/error/hasInAppHistory';
import { isCrdRoute } from '@/main/crdPages/error/isCrdRoute';
import { useCrdEnabled } from '@/main/crdPages/useCrdEnabled';
import { TopLevelRoutePath } from '@/main/routing/TopLevelRoutePath';
import { CrdLayoutWrapper } from '@/main/ui/layout/CrdLayoutWrapper';
import TopLevelLayout from '@/main/ui/layout/TopLevelLayout';

export type CrdAwareErrorComponentProps = {
  hasError?: boolean;
  error?: Error;
  isNotFound?: boolean;
  isNotAuthorized?: boolean;
  pathname?: string;
};

export function CrdAwareErrorComponent(props: CrdAwareErrorComponentProps) {
  const { t } = useTranslation('crd-error');
  const navigate = useNavigate();
  const crdEnabled = useCrdEnabled();
  const isCrd = isCrdRoute(props.pathname ?? '');
  const showGoBack = hasInAppHistory();

  usePageTitle(t('forbidden.title'));

  if (crdEnabled && isCrd && props.isNotAuthorized === true) {
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

  return (
    <TopLevelLayout>
      <Error40X {...props} />
    </TopLevelLayout>
  );
}
