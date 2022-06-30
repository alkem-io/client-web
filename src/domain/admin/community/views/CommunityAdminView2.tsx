import React, { FC } from 'react';
import DashboardGenericSection from '../../../shared/components/DashboardSections/DashboardGenericSection';
import EditMemberUsersWithPopup, {
  EditMemberUsersWithPopupProps,
} from '../../../../components/Admin/Community/EditMemberUsersWithPopup';
import { useTranslation } from 'react-i18next';

interface CommunityAdminViewProps extends Omit<EditMemberUsersWithPopupProps, 'entityName'> {
  headerText: string;
}

export const CommunityAdminView2: FC<CommunityAdminViewProps> = ({ headerText, ...editMembersProps }) => {
  const { t } = useTranslation();

  return (
    <DashboardGenericSection headerText={headerText}>
      <EditMemberUsersWithPopup {...editMembersProps} entityName={t('common.users')} />
    </DashboardGenericSection>
  );
};

export default CommunityAdminView2;
