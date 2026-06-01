import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useInnovationHubQuery } from '@/core/apollo/generated/apollo-hooks';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import { usePageTitle } from '@/core/routing/usePageTitle';
import { useQueryParams } from '@/core/routing/useQueryParams';
import Loading from '@/core/ui/loading/Loading';
import { CrdLayoutWrapper } from '@/main/ui/layout/CrdLayoutWrapper';

const CrdDashboardPage = lazyWithGlobalErrorHandler(() => import('@/main/crdPages/dashboard/DashboardPage'));
const CrdInnovationHubHomePage = lazyWithGlobalErrorHandler(
  () => import('@/main/crdPages/innovationHub/CrdInnovationHubHomePage')
);

/**
 * CRD `/home` dispatcher — mirrors the MUI `HomePage`. On an innovation-hub subdomain it
 * renders the new CRD `CrdInnovationHubHomePage` inside `CrdLayoutWrapper`. Otherwise
 * it renders the CRD dashboard. Subdomain resolution mirrors `useInnovationHub()`:
 * the server reads the host header in production; in local dev the `?subdomain=` query
 * param is used.
 */
const CrdHomePage = () => {
  const { t } = useTranslation();
  usePageTitle(t('pages.titles.alkemio'), { skipSuffix: true });

  const params = useQueryParams();
  const subdomain = import.meta.env.MODE === 'development' ? (params.get('subdomain') ?? undefined) : undefined;

  const { data: hubData, loading: innovationHubLoading } = useInnovationHubQuery({
    variables: { subdomain },
    fetchPolicy: 'cache-first',
  });
  const innovationHub = hubData?.platform.innovationHub;

  if (innovationHubLoading) {
    return <Loading />;
  }

  return (
    <CrdLayoutWrapper>
      <Suspense fallback={<Loading />}>
        {innovationHub ? <CrdInnovationHubHomePage innovationHubFromSubdomain={innovationHub} /> : <CrdDashboardPage />}
      </Suspense>
    </CrdLayoutWrapper>
  );
};

export default CrdHomePage;
