import React from 'react';
import { Identifiable } from '../../../../core/utils/Identifiable';
import ProfilePageBanner, { ProfilePageBannerProps } from '../../../common/profile/ProfilePageBanner';
import { buildAdminOrganizationUrl } from '../../../../main/routing/urlBuilders';

interface OrganizationPageBannerProps {
  organization:
    | (Identifiable & {
        nameID: string;
        profile: ProfilePageBannerProps['profile'];
      })
    | undefined;
  onSendMessage: ProfilePageBannerProps['onSendMessage'];
  canEdit: boolean;
  loading?: boolean;
}

const OrganizationPageBanner = ({
  organization,
  onSendMessage,
  canEdit,
  loading = false,
}: OrganizationPageBannerProps) => {
  const settingsUri = canEdit && organization ? buildAdminOrganizationUrl(organization.nameID) : undefined;

  return (
    <ProfilePageBanner
      entityId={organization?.id}
      profile={organization?.profile}
      onSendMessage={onSendMessage}
      settingsUri={settingsUri}
      loading={loading}
    />
  );
};

export default OrganizationPageBanner;
