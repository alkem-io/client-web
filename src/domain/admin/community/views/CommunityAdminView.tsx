import React, { FC } from 'react';
import DashboardGenericSection from '../../../shared/components/DashboardSections/DashboardGenericSection';
import EditMemberUsers, { EditMemberUsersProps } from '../../../../components/Admin/Community/EditMembersUsers';

interface CommunityAdminViewProps extends EditMemberUsersProps {
  headerText: string;
}

export const CommunityAdminView: FC<CommunityAdminViewProps> = ({ headerText, ...editMembersProps }) => {
  return (
    <DashboardGenericSection headerText={headerText}>
      <EditMemberUsers {...editMembersProps} />
    </DashboardGenericSection>
  );
};

export default CommunityAdminView;
