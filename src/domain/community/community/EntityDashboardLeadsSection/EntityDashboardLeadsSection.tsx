import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { EntityDashboardLeads } from '../EntityDashboardContributorsSection/Types';
import AssociatedOrganizationsView from '../../contributor/organization/AssociatedOrganizations/AssociatedOrganizationsView';
import OrganizationCardHorizontal, {
  OrganizationCardProps,
} from '../../contributor/organization/OrganizationCardHorizontal/OrganizationCardHorizontal';
import { buildUserProfileUrl } from '../../../../common/utils/urlBuilders';
import DashboardLeadUsers from './DashboardLeadUsers';
import { useUserContext } from '../../contributor/user';
import { mapToAssociatedOrganization } from '../../contributor/organization/AssociatedOrganizations/AssociatedOrganization';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';

const OrganizationCardTransparent = (props: OrganizationCardProps) => (
  <OrganizationCardHorizontal {...props} transparent />
);

interface EntityDashboardLeadsProps extends EntityDashboardLeads {
  organizationsHeader: string;
  usersHeader: string;
}

const EntityDashboardLeadsSection = ({
  leadUsers,
  leadOrganizations,
  usersHeader,
  organizationsHeader,
}: EntityDashboardLeadsProps) => {
  const { t } = useTranslation();

  const { user } = useUserContext();

  const leadOrganizationsMapped = useMemo(
    () => leadOrganizations?.map(org => mapToAssociatedOrganization(org, org.id)),
    [leadOrganizations, t, user?.user]
  );

  const leadUsersMapped = useMemo(() => {
    return leadUsers?.map(user => ({
      id: user.id,
      userUrl: buildUserProfileUrl(user.nameID),
      fullName: user.profile.displayName,
      city: user.profile.location?.city,
      country: user.profile.location?.country,
      avatarUrl: user.profile.visual?.uri,
      tags: user.profile.tagsets?.flatMap(({ tags }) => tags),
    }));
  }, [leadUsers]);

  return (
    <PageContentBlock>
      <PageContentBlockHeader title={organizationsHeader} />
      <AssociatedOrganizationsView
        organizations={leadOrganizationsMapped}
        organizationCardComponent={OrganizationCardTransparent}
        entityName={t('community.leading-organizations')}
      />
      {!!leadUsersMapped && leadUsersMapped.length > 0 && (
        <DashboardLeadUsers headerText={usersHeader} users={leadUsersMapped} />
      )}
    </PageContentBlock>
  );
};

export default EntityDashboardLeadsSection;
