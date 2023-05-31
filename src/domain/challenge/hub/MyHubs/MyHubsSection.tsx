import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { keyBy } from 'lodash';
import DashboardHubsSection, {
  DashboardHubSectionProps,
} from '../../../shared/components/DashboardSections/DashboardHubsSection';
import { useHubsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { Loading } from '../../../../common/components/core';
import { UserRolesInEntity } from '../../../community/contributor/user/providers/UserProvider/UserRolesInEntity';
import { HubVisibility } from '../../../../core/apollo/generated/graphql-schema';

interface MyHubsSectionProps {
  userHubRoles: UserRolesInEntity[] | undefined;
  loading?: boolean;
}

const MyHubsSection = ({ userHubRoles, loading }: MyHubsSectionProps) => {
  const { t } = useTranslation();

  const { data: hubsData, loading: areHubsLoading } = useHubsQuery({
    variables: { visibilities: [HubVisibility.Active, HubVisibility.Demo] },
  });

  const isLoading = loading || areHubsLoading;

  const hubRolesByHubId = useMemo(() => keyBy(userHubRoles, 'id'), [userHubRoles]);
  const hubs = useMemo(() => hubsData?.hubs.filter(({ id }) => hubRolesByHubId[id]) ?? [], [hubsData, hubRolesByHubId]);

  // TODO other labels such as Lead etc.
  // const isLead = (hubId: string) => hubRolesByHubId[hubId]?.roles.includes(USER_ROLE_HUB_LEAD);
  //
  const getHubCardProps: DashboardHubSectionProps['getHubCardProps'] = hub => {
    return {
      // lead: isLead(hub.id),
      member: false,
      isDemoHub: hub?.visibility === HubVisibility.Demo,
    };
  };

  if (isLoading) {
    return <Loading />;
  }

  if (hubs.length === 0) {
    return null;
  }

  return (
    <DashboardHubsSection
      headerText={t('pages.home.sections.my-hubs.header', { myHubsCount: hubs.length })}
      hubs={hubs}
      getHubCardProps={getHubCardProps}
    />
  );
};

export default MyHubsSection;
