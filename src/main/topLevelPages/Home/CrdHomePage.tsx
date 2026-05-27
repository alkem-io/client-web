import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import { usePageTitle } from '@/core/routing/usePageTitle';
import Loading from '@/core/ui/loading/Loading';
import useInnovationHub from '@/domain/innovationHub/useInnovationHub/useInnovationHub';
import { CrdLayoutWrapper } from '@/main/ui/layout/CrdLayoutWrapper';

const CrdDashboardPage = lazyWithGlobalErrorHandler(() => import('@/main/crdPages/dashboard/DashboardPage'));
const InnovationHubHomePage = lazyWithGlobalErrorHandler(
  () => import('@/domain/innovationHub/InnovationHubHomePage/InnovationHubHomePage')
);

/**
 * CRD `/home` dispatcher — mirrors the MUI `HomePage`. On an innovation-hub subdomain it
 * renders the (still-MUI) `InnovationHubHomePage`, which carries its own `TopLevelLayout` and
 * therefore must NOT be wrapped in `CrdLayoutWrapper`. Otherwise it renders the CRD dashboard
 * inside the CRD shell. Lives in `topLevelPages/` (not `crdPages/`) because it imports the MUI
 * hub page; CRD-migrating that page is a separate ticket.
 */
const CrdHomePage = () => {
  const { t } = useTranslation();
  usePageTitle(t('pages.titles.alkemio'), { skipSuffix: true });

  const { innovationHub, innovationHubLoading } = useInnovationHub();

  if (innovationHubLoading) {
    return <Loading />;
  }

  if (innovationHub) {
    return (
      <Suspense fallback={<Loading />}>
        <InnovationHubHomePage innovationHub={innovationHub} />
      </Suspense>
    );
  }

  return (
    <CrdLayoutWrapper>
      <Suspense fallback={<Loading />}>
        <CrdDashboardPage />
      </Suspense>
    </CrdLayoutWrapper>
  );
};

export default CrdHomePage;
