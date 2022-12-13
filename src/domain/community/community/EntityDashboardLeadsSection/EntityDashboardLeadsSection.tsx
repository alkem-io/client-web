import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { EntityDashboardLeads } from '../EntityDashboardContributorsSection/Types';
import AssociatedOrganizationsView from '../../contributor/organization/AssociatedOrganizations/AssociatedOrganizationsView';
import OrganizationCard, {
  OrganizationCardProps,
} from '../../../../common/components/composite/common/cards/Organization/OrganizationCard';
import { buildUserProfileUrl } from '../../../../common/utils/urlBuilders';
import DashboardLeadUsers from './DashboardLeadUsers';
import { useUserContext } from '../../contributor/user';
import { mapToAssociatedOrganization } from '../../contributor/organization/AssociatedOrganizations/AssociatedOrganization';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';

const OrganizationCardTransparent = (props: OrganizationCardProps) => <OrganizationCard {...props} transparent />;

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
    () => leadOrganizations?.map(org => mapToAssociatedOrganization(org, org.id, user?.user, t)),
    [leadOrganizations, t, user?.user]
  );

  const leadUsersMapped = useMemo(() => {
    return leadUsers?.map(user => ({
      id: user.id,
      userUrl: buildUserProfileUrl(user.nameID),
      fullName: user.displayName,
      city: user.profile?.location?.city,
      country: user.profile?.location?.country,
      avatarUrl: user.profile?.avatar?.uri,
      tags: user.profile?.tagsets?.flatMap(({ tags }) => tags),
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
