import React from 'react';
import CommunityContributorsAccordion from './CommunityContributorsAccordion';
import useOrganizationCardProps from '../utils/useOrganizationCardProps';
import useUserCardProps from '../utils/useUserCardProps';
import { useTranslation } from 'react-i18next';
import NoOrganizations from './NoOrganizations';
import { Contributors, ContributorType } from './types';
import { PossiblyUndefinedProps } from '../../shared/types/PossiblyUndefinedProps';

interface CommunityContributorsSectionProps extends PossiblyUndefinedProps<Contributors> {
  resourceId: string | undefined;
  loading?: boolean;
  contributorType: ContributorType;
}

const headingBackgroundColor = '#D3D3D3';

const accordionSummaryStyle = {
  backgroundColor: headingBackgroundColor,
} as const;

const accordionStyle = {
  border: `1px solid ${headingBackgroundColor}`,
} as const;

const ContributorTypeLabel: Record<ContributorType, 'leading-contributors' | 'contributors'> = {
  leading: 'leading-contributors',
  member: 'contributors',
};

const CommunityContributorsSection = ({
  organizations,
  users,
  resourceId,
  contributorType,
  loading = false,
}: CommunityContributorsSectionProps) => {
  const { t } = useTranslation();

  return (
    <CommunityContributorsAccordion
      title={t(`pages.generic.sections.community.${ContributorTypeLabel[contributorType]}` as const)}
      ariaKey={ContributorTypeLabel[contributorType]}
      organizations={useOrganizationCardProps(organizations)}
      users={useUserCardProps(users, resourceId)}
      organizationsCount={organizations?.length}
      usersCount={users?.length}
      loading={loading}
      noOrganizationsView={<NoOrganizations type={contributorType} />}
      sx={accordionStyle}
      summarySx={accordionSummaryStyle}
    />
  );
};

export default CommunityContributorsSection;
