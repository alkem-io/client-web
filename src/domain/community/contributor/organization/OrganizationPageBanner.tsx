import { Identifiable } from '@/core/utils/Identifiable';
import ProfilePageBanner, { ProfilePageBannerProps } from '@/domain/common/profile/ProfilePageBanner';
import { buildSettingsUrl } from '@/main/routing/urlBuilders';

type OrganizationPageBannerProps = {
  organization:
    | (Identifiable & {
        profile: ProfilePageBannerProps['profile'] & { url: string };
      })
    | undefined;
  onSendMessage: ProfilePageBannerProps['onSendMessage'];
  canEdit: boolean;
  loading?: boolean;
};

const OrganizationPageBanner = ({
  organization,
  onSendMessage,
  canEdit,
  loading = false,
}: OrganizationPageBannerProps) => {
  const settingsUri = canEdit && organization ? buildSettingsUrl(organization.profile.url) : undefined;

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
