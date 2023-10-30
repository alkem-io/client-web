import React, { useMemo, useState } from 'react';
import PageBanner from '../../../core/ui/layout/pageBanner/PageBanner';
import PageBannerCardWithVisual from '../../journey/common/PageBanner/JourneyPageBannerCard/PageBannerCardWithVisual';
import SizeableAvatar from '../../../core/ui/avatar/SizeableAvatar';
import { PageTitle } from '../../../core/ui/typography';
import LocationCaption from '../../../core/ui/location/LocationCaption';
import { Actions } from '../../../core/ui/actions/Actions';
import { IconButton, Theme, ThemeProvider, useMediaQuery } from '@mui/material';
import { MailOutlined, SettingsOutlined } from '@mui/icons-material';
import RouterLink from '../../../core/ui/link/RouterLink';
import { DirectMessageDialog } from '../../communication/messaging/DirectMessaging/DirectMessageDialog';
import { Visual } from '../visual/Visual';
import { Location } from '../../../core/ui/location/getLocationString';
import { useTranslation } from 'react-i18next';
import PageBannerWatermark from '../../../main/ui/platformNavigation/PageBannerWatermark';
import providePrimaryColor from '../../../core/ui/themes/utils/providePrimaryColor';
import { COLOR_HUB } from '../../../core/ui/palette/palette';

const provideHubColor = providePrimaryColor(COLOR_HUB);

const banner: Visual = {
  uri: '/alkemio-banner/global-banner.jpg',
};

export interface ProfilePageBannerProps {
  entityId: string | undefined;
  profile:
    | {
        displayName: string;
        tagline?: string;
        avatar?: Visual;
        location?: Location;
        tagset?: {
          tags: string[];
        };
        tagsets?: {
          tags: string[];
        }[];
      }
    | undefined;
  settingsUri?: string;
  onSendMessage?: (messageText: string) => Promise<void>;
  loading?: boolean;
}

const ProfilePageBanner = ({
  entityId,
  profile,
  settingsUri,
  onSendMessage,
  loading = false,
}: ProfilePageBannerProps) => {
  const isMobile = useMediaQuery<Theme>(theme => theme.breakpoints.down('lg'));

  const { t } = useTranslation();

  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);

  const closeMessageDialog = () => setIsMessageDialogOpen(false);
  const openMessageDialog = () => setIsMessageDialogOpen(true);

  const tags = useMemo(
    () => profile?.tagset?.tags ?? profile?.tagsets?.flatMap(({ tags }) => tags),
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

  const pageBannerWatermark = isMobile ? null : <PageBannerWatermark />;

  return (
    <>
      <PageBanner
        banner={banner}
        cardComponent={PageBannerCardWithVisual}
        visual={<SizeableAvatar src={profile?.avatar?.uri} />}
        header={
          <>
            <ThemeProvider theme={provideHubColor}>
              <PageTitle color="primary" noWrap>
                {profile?.displayName}
              </PageTitle>
            </ThemeProvider>
            {profile?.location && <LocationCaption {...profile?.location} />}
            <Actions gap={0}>
              {onSendMessage && (
                <IconButton size="small" onClick={openMessageDialog}>
                  <MailOutlined />
                </IconButton>
              )}
              {settingsUri && (
                <IconButton size="small" component={RouterLink} to={settingsUri}>
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
