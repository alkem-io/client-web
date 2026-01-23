import React, { Suspense } from 'react';
import HomePageLayout from './HomePageLayout';
import Loading from '@/core/ui/loading/Loading';
import useInnovationHub from '@/domain/innovationHub/useInnovationHub/useInnovationHub';
import PageContent from '@/core/ui/content/PageContent';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import { usePageTitle } from '@/core/routing/usePageTitle';

const MyDashboard = lazyWithGlobalErrorHandler(() => import('@/main/topLevelPages/myDashboard/MyDashboard'));
const InnovationHubHomePage = lazyWithGlobalErrorHandler(
  () => import('@/domain/innovationHub/InnovationHubHomePage/InnovationHubHomePage')
);

const HomePage = () => {
  // Set browser tab title to just "Alkemio" for home page
  usePageTitle('Alkemio', { skipSuffix: true });
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
