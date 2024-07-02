import React, { PropsWithChildren, ReactElement, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { EntityDashboardLeads } from '../EntityDashboardContributorsSection/Types';
import AssociatedOrganizationsView from '../../contributor/organization/AssociatedOrganizations/AssociatedOrganizationsView';
import { buildUserProfileUrl } from '../../../../main/routing/urlBuilders';
import { useUserContext } from '../../user';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import LeadOrganizationCard, { LeadOrganizationCardProps } from '../LeadCards/LeadOrganizationCard';
import { SvgIconProps } from '@mui/material';
import DashboardLeads from './DashboardLeads';
import LeadContributorCard from '../LeadCards/LeadContributorCard';
import LeadUserCard from '../LeadCards/LeadUserCard';

const OrganizationCardTransparent = (props: LeadOrganizationCardProps) => <LeadOrganizationCard {...props} />;

interface EntityDashboardLeadsProps extends EntityDashboardLeads {
  organizationsHeader: string;
  organizationsHeaderIcon?: ReactElement<SvgIconProps>;
  usersHeader?: string;
}

const EntityDashboardLeadsSection = ({
  leadUsers,
  leadOrganizations,
  leadVirtualContributors,
  usersHeader,
  organizationsHeader,
  organizationsHeaderIcon,
  children,
}: PropsWithChildren<EntityDashboardLeadsProps>) => {
  const { t } = useTranslation();

  const { user } = useUserContext();

  const leadOrganizationsMapped = useMemo(
    () =>
      leadOrganizations?.map(org => ({
        key: org.id,
        id: org.id,
        organizationUrl: org.profile.url,
        avatarSrc: org.profile.avatar?.uri,
        displayName: org.profile.displayName,
        city: org.profile.location?.city,
        country: org.profile.location?.country,
        tagline: org.profile.tagline,
        tags: org.profile.tagsets?.flatMap(({ tags }) => tags),
      })),
    [leadOrganizations, user?.user]
  );

  const leadUsersMapped = useMemo(() => {
    return leadUsers?.map(user => ({
      id: user.id,
      userUrl: buildUserProfileUrl(user.nameID),
      fullName: user.profile.displayName,
      city: user.profile.location?.city,
      country: user.profile.location?.country,
      avatarUrl: user.profile.avatar?.uri,
      tags: user.profile.tagsets?.flatMap(({ tags }) => tags),
    }));
  }, [leadUsers]);

  const leadUsersSectionVisible = !!leadUsersMapped && leadUsersMapped.length > 0;
  const leadOrganizationsSectionVisible = !!leadOrganizationsMapped && leadOrganizationsMapped.length > 0;

  if (!leadUsersSectionVisible && !leadOrganizationsSectionVisible) return null;

  return (
    <PageContentBlock>
      {leadUsersSectionVisible && usersHeader && (
        <DashboardLeads headerText={usersHeader} contributors={leadUsersMapped} CardComponent={LeadUserCard} />
      )}
      {leadOrganizationsSectionVisible && organizationsHeader && (
        <>
          <PageContentBlockHeader title={organizationsHeader}>{organizationsHeaderIcon}</PageContentBlockHeader>
          <AssociatedOrganizationsView
            organizations={leadOrganizationsMapped}
            organizationCardComponent={OrganizationCardTransparent}
            entityName={t('community.leading-organizations')}
          />
        </>
      )}
      {leadUsersSectionVisible && usersHeader && (
        <DashboardLeads headerText="" contributors={leadVirtualContributors} CardComponent={LeadContributorCard} />
      )}
      {children}
    </PageContentBlock>
  );
};

export default EntityDashboardLeadsSection;
