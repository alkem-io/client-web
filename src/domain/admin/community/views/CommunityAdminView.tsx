import React, { FC } from 'react';
import DashboardGenericSection from '../../../../components/composite/common/sections/DashboardGenericSection';
import EditMembers, { EditMembersProps } from '../../../../components/Admin/Community/EditMembers';

interface CommunityAdminViewProps extends EditMembersProps {
  headerText: string;
}

export const CommunityAdminView: FC<CommunityAdminViewProps> = ({ headerText, ...editMembersProps }) => {
  return (
    <DashboardGenericSection headerText={headerText}>
      <EditMembers {...editMembersProps} />
    </DashboardGenericSection>
  );
};

export default CommunityAdminView;
