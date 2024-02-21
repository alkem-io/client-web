import React, { PropsWithChildren, ReactElement, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { EntityDashboardLeads } from '../EntityDashboardContributorsSection/Types';
import AssociatedOrganizationsView from '../../contributor/organization/AssociatedOrganizations/AssociatedOrganizationsView';
import { buildOrganizationUrl, buildUserProfileUrl } from '../../../../main/routing/urlBuilders';
import DashboardLeadUsers from './DashboardLeadUsers';
import { useUserContext } from '../../user';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import LeadOrganizationCard, { LeadOrganizationCardProps } from '../LeadCards/LeadOrganizationCard';
import { SvgIconProps } from '@mui/material';

const OrganizationCardTransparent = (props: LeadOrganizationCardProps) => <LeadOrganizationCard {...props} />;

interface EntityDashboardLeadsProps extends EntityDashboardLeads {
  organizationsHeader: string;
  organizationsHeaderIcon?: ReactElement<SvgIconProps>;
  usersHeader?: string;
}

const EntityDashboardLeadsSection = ({
  leadUsers,
  leadOrganizations,
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
        organizationUrl: buildOrganizationUrl(org.nameID),
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

  const leadUsersSectionVisible = !!leadUsersMapped && leadUsersMapped.length > 0 && usersHeader;
  const leadOrganizationsSectionVisible =
    !!leadOrganizationsMapped && leadOrganizationsMapped.length > 0 && organizationsHeader;

  if (!leadUsersSectionVisible && !leadOrganizationsSectionVisible) return null;

  return (
    <PageContentBlock>
      {leadUsersSectionVisible && <DashboardLeadUsers headerText={usersHeader} users={leadUsersMapped} />}
      {leadOrganizationsSectionVisible && (
        <>
          <PageContentBlockHeader title={organizationsHeader}>{organizationsHeaderIcon}</PageContentBlockHeader>
          <AssociatedOrganizationsView
            organizations={leadOrganizationsMapped}
            organizationCardComponent={OrganizationCardTransparent}
            entityName={t('community.leading-organizations')}
          />
        </>
      )}
      {children}
    </PageContentBlock>
  );
};

export default EntityDashboardLeadsSection;
