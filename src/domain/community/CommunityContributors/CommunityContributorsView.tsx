import Typography from '@mui/material/Typography';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SectionSpacer } from '../../shared/components/Section/Section';
import { styled } from '@mui/styles';
import withOptionalCount from '../../shared/utils/withOptionalCount';
import ContributingOrganizations, { ContributingOrganizationsProps } from './ContributingOrganizations';
import { ContributingUsersProps } from './ContributingUsers';
import DashboardContributingUsers from '../EntityDashboardContributorsSection/DashboardContributingUsers';
import { mapUserCardPropsToContributorCardProps } from '../utils/useCommunityMembersAsCardProps';

export interface CommunityContributorsViewProps extends ContributingOrganizationsProps, ContributingUsersProps {
  loading?: boolean;
  organizationsCount: number | undefined;
  usersCount: number | undefined;
}

const SubSectionHeading = styled(props => <Typography variant="h3" {...props} />)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
}));

const CommunityContributorsView = ({
  organizations = [],
  users = [],
  organizationsCount,
  usersCount,
  noOrganizationsView,
  loading,
}: CommunityContributorsViewProps) => {
  const { t } = useTranslation();

  return (
    <>
      <SubSectionHeading>{withOptionalCount(t('common.organizations'), organizationsCount)}</SubSectionHeading>
      <ContributingOrganizations
        organizations={organizations}
        loading={loading}
        noOrganizationsView={noOrganizationsView}
      />
      <SectionSpacer />
      <DashboardContributingUsers
        headerText={t('common.users')}
        users={users?.map(mapUserCardPropsToContributorCardProps)}
        usersCount={usersCount}
      />
    </>
  );
};

export default CommunityContributorsView;
