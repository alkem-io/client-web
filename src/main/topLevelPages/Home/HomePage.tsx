import React from 'react';
import HomePageLayout from './HomePageLayout';
import InnovationHubHomePage from '../../../domain/innovationHub/InnovationHubHomePage/InnovationHubHomePage';
import Loading from '../../../core/ui/loading/Loading';
import useInnovationHub from '../../../domain/innovationHub/useInnovationHub/useInnovationHub';
import LegacyHomePage from '../myDashboard/legacy/LegacyHomePage';
import useHasPlatformLevelPrivilege from '../../../domain/community/user/PlatformLevelAuthorization/useHasPlatformLevelPrivilege';
import { AuthorizationPrivilege } from '../../../core/apollo/generated/graphql-schema';
import MyDashboard from '../myDashboard/MyDashboard';

const HomePage = () => {
  const { innovationHub, innovationHubLoading } = useInnovationHub();

  const [canAccessDashboardRefresh, { loading: isLoadingPrivileges }] = useHasPlatformLevelPrivilege(
    AuthorizationPrivilege.AccessDashboardRefresh
  );

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

  if (isLoadingPrivileges) {
    return (
      <HomePageLayout>
        <Loading />
      </HomePageLayout>
    );
  }

  if (canAccessDashboardRefresh) {
    return <MyDashboard />;
  } else {
    return <LegacyHomePage />;
  }
};

export default HomePage;
