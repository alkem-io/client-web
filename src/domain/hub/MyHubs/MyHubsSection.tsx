import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardHubsSection, {
  DashboardHubSectionProps,
} from '../../shared/components/DashboardSections/DashboardHubsSection';
import { useHubsQuery } from '../../../hooks/generated/graphql';
import withOptionalCount from '../../shared/utils/withOptionalCount';
import { Loading } from '../../../common/components/core';
import { EntityContributionCardLabel } from '../../../common/components/composite/common/cards/ContributionCard/EntityContributionCard';
import { USER_ROLE_HUB_LEAD, UserRolesInEntity } from '../../user/providers/UserProvider/UserRolesInEntity';
import { keyBy } from 'lodash';

interface MyHubsSectionProps {
  userHubRoles: UserRolesInEntity[] | undefined;
  loading?: boolean;
}

const MyHubsSection = ({ userHubRoles, loading }: MyHubsSectionProps) => {
  const { t } = useTranslation();

  const { data: hubsData, loading: areHubsLoading } = useHubsQuery();

  const isLoading = loading || areHubsLoading;

  const myHubsCount = userHubRoles?.length;
  const hubRolesByHubId = useMemo(() => keyBy(userHubRoles, 'id'), [userHubRoles]);
  const hubs = useMemo(() => hubsData?.hubs.filter(({ id }) => hubRolesByHubId[id]) ?? [], [hubsData, hubRolesByHubId]);

  const isLead = (hubId: string) => hubRolesByHubId[hubId]?.roles.includes(USER_ROLE_HUB_LEAD);

  const getHubCardLabel: DashboardHubSectionProps['getHubCardLabel'] = hub => {
    if (isLead(hub.id)) {
      return EntityContributionCardLabel.Lead;
    }
  };

  return (
    <DashboardHubsSection
      headerText={withOptionalCount(t('pages.home.sections.my-hubs.header'), myHubsCount)}
      subHeaderText={t('pages.home.sections.my-hubs.subheader')}
      hubs={hubs}
      getHubCardLabel={getHubCardLabel}
    >
      {isLoading && <Loading />}
    </DashboardHubsSection>
  );
};

export default MyHubsSection;
