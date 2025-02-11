import { Identifiable } from '@/core/utils/Identifiable';
import { UserCardProps } from '@/domain/community/user/userCard/UserCard';
import { SectionSpacer } from '@/domain/shared/components/Section/Section';
import withOptionalCount from '@/domain/shared/utils/withOptionalCount';
import { styled } from '@mui/material';
import Typography from '@mui/material/Typography';
import { ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardContributingUsers, {
  DashboardContributingUsersProps,
} from '../EntityDashboardContributorsSection/DashboardContributingUsers';
import { mapUserCardPropsToContributorCardProps } from '../utils/useCommunityMembersAsCardProps';
import ContributingOrganizations, { ContributingOrganizationsProps } from './ContributingOrganizations';

export interface RoleSetContributorTypesViewProps extends ContributingOrganizationsProps {
  loading?: boolean;
  organizationsCount: number | undefined;
  users: (Identifiable & UserCardProps)[] | undefined;
  usersCount: number | undefined; // TODO display or remove prop
  usersComponent?: ComponentType<DashboardContributingUsersProps>;
}

const SubSectionHeading = styled(props => <Typography variant="h3" {...props} />)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
}));

const RoleSetContributorTypesView = ({
  organizations = [],
  users = [],
  organizationsCount,
  noOrganizationsView,
  loading,
  usersComponent: UsersComponent = DashboardContributingUsers,
}: RoleSetContributorTypesViewProps) => {
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
      <UsersComponent users={users?.map(mapUserCardPropsToContributorCardProps)} />
    </>
  );
};

export default RoleSetContributorTypesView;
