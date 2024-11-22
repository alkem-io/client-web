import React, { Suspense } from 'react';
import HomePageLayout from './HomePageLayout';
import InnovationHubHomePage from '@/domain/innovationHub/InnovationHubHomePage/InnovationHubHomePage';
import Loading from '@/core/ui/loading/Loading';
import useInnovationHub from '@/domain/innovationHub/useInnovationHub/useInnovationHub';
import PageContent from '@/core/ui/content/PageContent';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';

const MyDashboard = lazyWithGlobalErrorHandler(() => import('../myDashboard/MyDashboard'));

const HomePage = () => {
  const { innovationHub, innovationHubLoading } = useInnovationHub();

  if (innovationHubLoading) {
    return (
      <HomePageLayout>
        <Loading />
      </HomePageLayout>
    );
  }

  if (innovationHub) {
    return <InnovationHubHomePage innovationHub={innovationHub} />;
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
