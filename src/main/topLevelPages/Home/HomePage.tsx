import React from 'react';
import HomePageLayout from './HomePageLayout';
import InnovationHubHomePage from '../../../domain/innovationHub/InnovationHubHomePage/InnovationHubHomePage';
import Loading from '../../../core/ui/loading/Loading';
import useInnovationHub from '../../../domain/innovationHub/useInnovationHub/useInnovationHub';
import MyDashboard from '../myDashboard/MyDashboard';

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

  return <MyDashboard />;
};

export default HomePage;
