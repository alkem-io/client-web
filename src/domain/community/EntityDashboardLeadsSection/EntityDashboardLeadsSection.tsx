import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardGenericSection from '../../shared/components/DashboardSections/DashboardGenericSection';
import { SectionSpacer } from '../../shared/components/Section/Section';
import { EntityDashboardLeads } from '../EntityDashboardContributorsSection/Types';
import AssociatedOrganizationsView from '../../organization/AssociatedOrganizations/AssociatedOrganizationsView';
import OrganizationCard, {
  OrganizationCardProps,
} from '../../../components/composite/common/cards/Organization/OrganizationCard';
import SectionHeader from '../../shared/components/Section/SectionHeader';
import { buildUserProfileUrl } from '../../../utils/urlBuilders';
import DashboardLeadUsers from './DashboardLeadUsers';
import { useUserContext } from '../../../hooks';
import { mapToAssociatedOrganization } from '../../organization/AssociatedOrganizations/AssociatedOrganization';
import { EntityPageSection } from '../../shared/layout/EntityPageSection';

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
    [leadOrganizations]
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
    <DashboardGenericSection navText={t('buttons.see-more')} navLink={EntityPageSection.About}>
      <SectionHeader text={organizationsHeader} />
      <SectionSpacer />
      <AssociatedOrganizationsView
        organizations={leadOrganizationsMapped}
        organizationCardComponent={OrganizationCardTransparent}
        entityName={t('community.leading-organizations')}
      />
      <SectionSpacer double />
      <DashboardLeadUsers headerText={usersHeader} users={leadUsersMapped} />
    </DashboardGenericSection>
  );
};

export default EntityDashboardLeadsSection;
