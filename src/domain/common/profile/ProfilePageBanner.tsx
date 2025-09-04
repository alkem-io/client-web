import { useMemo, useState } from 'react';
import PageBanner from '@/core/ui/layout/pageBanner/PageBanner';
import PageBannerCardWithVisual from '@/domain/space/components/cards/components/PageBannerCardWithVisual';
import Avatar from '@/core/ui/avatar/Avatar';
import { PageTitle } from '@/core/ui/typography';
import LocationCaption from '@/core/ui/location/LocationCaption';
import { Actions } from '@/core/ui/actions/Actions';
import { IconButton } from '@mui/material';
import { MailOutlined, SettingsOutlined } from '@mui/icons-material';
import RouterLink from '@/core/ui/link/RouterLink';
import { DirectMessageDialog } from '@/domain/communication/messaging/DirectMessaging/DirectMessageDialog';
import { Visual } from '../visual/Visual';
import { useTranslation } from 'react-i18next';
import PageBannerWatermark from '@/main/ui/platformNavigation/PageBannerWatermark';
import VirtualContributorLabel from '@/domain/community/virtualContributor/VirtualContributorLabel';
import { defaultPageBanner } from '@/main/ui/layout/topLevelPageLayout/TopLevelPageBanner';
import { useScreenSize } from '@/core/ui/grid/constants';
import { TagsetModel } from '../tagset/TagsetModel';
import { LocationModel } from '../location/LocationModel';

export interface ProfilePageBannerProps {
  entityId: string | undefined;
  profile:
    | {
        displayName: string;
        tagline?: string;
        avatar?: Visual;
        location?: LocationModel;
        tagset?: {
          tags: string[];
        };
        tagsets?: TagsetModel[];
        url?: string;
      }
    | undefined;
  settingsUri?: string;
  onSendMessage?: (messageText: string) => Promise<void>;
  loading?: boolean;
  isVirtualContributor?: boolean;
}

const ProfilePageBanner = ({
  entityId,
  profile,
  settingsUri,
  onSendMessage,
  loading = false,
  isVirtualContributor = false,
}: ProfilePageBannerProps) => {
  const { isLargeScreen } = useScreenSize();

  const { t } = useTranslation();

  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);

  const closeMessageDialog = () => setIsMessageDialogOpen(false);
  const openMessageDialog = () => setIsMessageDialogOpen(true);

  const tags = useMemo(
    () => profile?.tagset?.tags ?? profile?.tagsets?.flatMap(({ tags }) => tags || []),
    [profile?.tagsets]
  );

  const messageReceivers = useMemo(() => {
    if (!entityId) {
      return;
    }

    return [
      {
        id: entityId,
        displayName: profile?.displayName,
        avatarUri: profile?.avatar?.uri,
        city: profile?.location?.city,
        country: profile?.location?.country,
      },
    ];
  }, [entityId, profile]);

  const pageBannerWatermark = !isLargeScreen ? null : <PageBannerWatermark />;

  return (
    <>
      <PageBanner
        banner={defaultPageBanner}
        cardComponent={PageBannerCardWithVisual}
        visual={
          <Avatar
            src={profile?.avatar?.uri}
            size="large"
            ariaLabel={
              profile?.displayName ? t('common.avatar-of', { user: profile?.displayName }) : t('common.avatar')
            }
          />
        }
        header={
          <>
            <PageTitle color="primary" noWrap>
              {profile?.displayName}
            </PageTitle>
            {profile?.location && <LocationCaption {...profile?.location} />}
            <Actions gap={0}>
              {isVirtualContributor && <VirtualContributorLabel chip />}
              {onSendMessage && (
                <IconButton size="small" onClick={openMessageDialog} aria-label={t('common.email')}>
                  <MailOutlined />
                </IconButton>
              )}
              {settingsUri && (
                <IconButton size="small" component={RouterLink} to={settingsUri} aria-label={t('common.settings')}>
                  <SettingsOutlined />
                </IconButton>
              )}
            </Actions>
          </>
        }
        subtitle={profile?.tagline}
        tags={tags}
        loading={loading}
        watermark={pageBannerWatermark}
      />
      {onSendMessage && (
        <DirectMessageDialog
          title={t('send-message-dialog.direct-message-title')}
          open={isMessageDialogOpen}
          onClose={closeMessageDialog}
          onSendMessage={onSendMessage}
          messageReceivers={messageReceivers}
        />
      )}
    </>
  );
};

export default ProfilePageBanner;
