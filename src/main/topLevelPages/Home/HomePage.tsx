import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import { usePageTitle } from '@/core/routing/usePageTitle';
import PageContent from '@/core/ui/content/PageContent';
import Loading from '@/core/ui/loading/Loading';
import useInnovationHub from '@/domain/innovationHub/useInnovationHub/useInnovationHub';
import HomePageLayout from './HomePageLayout';

const MyDashboard = lazyWithGlobalErrorHandler(() => import('@/main/topLevelPages/myDashboard/MyDashboard'));
const InnovationHubHomePage = lazyWithGlobalErrorHandler(
  () => import('@/domain/innovationHub/InnovationHubHomePage/InnovationHubHomePage')
);

const HomePage = () => {
  const { t } = useTranslation();
  usePageTitle(t('pages.titles.alkemio'), { skipSuffix: true });

  const { innovationHub, innovationHubLoading } = useInnovationHub();

  if (innovationHubLoading) {
    return (
      <HomePageLayout>
        <Loading />
      </HomePageLayout>
    );
  }

  if (innovationHub) {
    return (
      <Suspense fallback={<Loading />}>
        <InnovationHubHomePage innovationHub={innovationHub} />
      </Suspense>
    );
  }

  return (
    <HomePageLayout>
      <PageContent>
        <Suspense fallback={<Loading />}>
          <MyDashboard />
        </Suspense>
      </PageContent>
    </HomePageLayout>
  );
};

export default HomePage;
