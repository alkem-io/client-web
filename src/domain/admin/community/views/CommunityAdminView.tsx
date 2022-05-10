import React, { FC } from 'react';
import EditCommunityMembers, {
  CommunityCredentials,
} from '../../../../components/Admin/Authorization/EditCommunityMembers';
import { WithCommunity } from '../../../../components/Admin/Community/CommunityTypes';
import DashboardGenericSection from '../../../../components/composite/common/sections/DashboardGenericSection';
import { useTranslation } from 'react-i18next';

interface CommunityAdminViewProps extends WithCommunity {
  credential: CommunityCredentials;
  resourceId: string;
}

export const CommunityAdminView: FC<CommunityAdminViewProps> = ({
  communityId,
  parentCommunityId,
  credential,
  resourceId,
}) => {
  const { t } = useTranslation();

  return (
    <DashboardGenericSection headerText={t('common.users')}>
      <EditCommunityMembers
        credential={credential}
        resourceId={resourceId}
        communityId={communityId || ''}
        parentCommunityId={parentCommunityId}
      />
    </DashboardGenericSection>
  );
};

export default CommunityAdminView;
