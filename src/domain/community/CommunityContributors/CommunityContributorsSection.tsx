import React from 'react';
import CommunityContributorsAccordion from './CommunityContributorsAccordion';
import useOrganizationCardProps from '../utils/useOrganizationCardProps';
import useUserCardProps from '../utils/useUserCardProps';
import { useTranslation } from 'react-i18next';
import { OrganizationCardFragment, UserCardFragment } from '../../../models/graphql-schema';

type OptionalLeadOrganizations =
  | {
      leadOrganizations: OrganizationCardFragment[] | undefined;
      isHub?: false;
    }
  | {
      isHub: true;
    };

type CommunityContributorsSectionProps = OptionalLeadOrganizations & {
  leadUsers: UserCardFragment[] | undefined;
  memberOrganizations: OrganizationCardFragment[] | undefined;
  memberUsers: UserCardFragment[] | undefined;
  resourceId: string | undefined;
  loading?: boolean;
};

const CommunityContributorsSection = ({
  leadUsers,
  memberOrganizations,
  memberUsers,
  resourceId,
  loading = false,
  ...optionalProps
}: CommunityContributorsSectionProps) => {
  const { t } = useTranslation();

  const leadOrganizations = optionalProps.isHub ? undefined : optionalProps.leadOrganizations;

  return (
    <>
      <CommunityContributorsAccordion
        title={t('pages.generic.sections.community.leading-contributors')}
        ariaKey="leading-contributors"
        organizations={useOrganizationCardProps(leadOrganizations)}
        users={useUserCardProps(leadUsers, resourceId)}
        organizationsCount={leadOrganizations?.length}
        usersCount={leadUsers?.length}
        loading={loading}
        hideOrganizations={optionalProps.isHub}
      />
      <CommunityContributorsAccordion
        title={t('pages.generic.sections.community.contributors')}
        ariaKey="contributors"
        organizations={useOrganizationCardProps(memberOrganizations)}
        users={useUserCardProps(memberUsers, resourceId)}
        organizationsCount={memberOrganizations?.length}
        usersCount={memberUsers?.length}
        loading={loading}
      />
    </>
  );
};

export default CommunityContributorsSection;
