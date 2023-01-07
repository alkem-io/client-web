import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { keyBy } from 'lodash';
import DashboardHubsSection, {
  DashboardHubSectionProps,
} from '../../../shared/components/DashboardSections/DashboardHubsSection';
import { useHubsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { Loading } from '../../../../common/components/core';
import { UserRolesInEntity } from '../../../community/contributor/user/providers/UserProvider/UserRolesInEntity';

interface MyHubsSectionProps {
  userHubRoles: UserRolesInEntity[] | undefined;
  username?: string;
  loading?: boolean;
}

const MyHubsSection = ({ userHubRoles, loading, username }: MyHubsSectionProps) => {
  const { t } = useTranslation();

  const { data: hubsData, loading: areHubsLoading } = useHubsQuery();

  const isLoading = loading || areHubsLoading;

  const myHubsCount = userHubRoles?.length;
  const hubRolesByHubId = useMemo(() => keyBy(userHubRoles, 'id'), [userHubRoles]);
  const hubs = useMemo(() => hubsData?.hubs.filter(({ id }) => hubRolesByHubId[id]) ?? [], [hubsData, hubRolesByHubId]);

  // TODO other labels such as Lead etc.
  // const isLead = (hubId: string) => hubRolesByHubId[hubId]?.roles.includes(USER_ROLE_HUB_LEAD);
  //
  const getHubCardProps: DashboardHubSectionProps['getHubCardProps'] = (/* hub */) => {
    return {
      // lead: isLead(hub.id),
      member: false,
    };
  };

  return (
    <DashboardHubsSection
      headerText={t('pages.home.sections.my-hubs.header', {
        myHubsCount,
        username,
      })}
      hubs={hubs}
      getHubCardProps={getHubCardProps}
    >
      {isLoading && <Loading />}
    </DashboardHubsSection>
  );
};

export default MyHubsSection;
