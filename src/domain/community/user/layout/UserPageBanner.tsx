import React, { useCallback, useMemo, useState } from 'react';
import { useSendMessageToUserMutation } from '../../../../core/apollo/generated/apollo-hooks';
import { useTranslation } from 'react-i18next';
import PageBannerCardWithVisual from '../../../journey/common/PageBanner/JourneyPageBannerCard/PageBannerCardWithVisual';
import SizeableAvatar from '../../../../core/ui/avatar/SizeableAvatar';
import PageBanner from '../../../../core/ui/layout/pageBanner/PageBanner';
import { useUserContext } from '../hooks/useUserContext';
import { Visual } from '../../../common/visual/Visual';
import { IconButton } from '@mui/material';
import { MailOutlined, SettingsOutlined } from '@mui/icons-material';
import { DirectMessageDialog } from '../../../communication/messaging/DirectMessaging/DirectMessageDialog';
import RouterLink from '../../../../core/ui/link/RouterLink';
import { buildUserProfileSettingsUrl } from '../../../../main/routing/urlBuilders';
import LocationCaption from '../../../../core/ui/location/LocationCaption';
import { PageTitle } from '../../../../core/ui/typography';
import { Actions } from '../../../../core/ui/actions/Actions';
import { useUserMetadata } from '../hooks/useUserMetadata';
import { useUrlParams } from '../../../../core/routing/useUrlParams';

const TAGSET_NAME = 'skills';

const banner: Visual = {
  uri: '/alkemio-banner/global-banner.jpg',
};

const UserPageBanner = () => {
  const { userNameId } = useUrlParams();

  if (!userNameId) {
    throw new Error('User nameID not present');
  }

  const { user: currentUser } = useUserContext();

  const { user, loading } = useUserMetadata(userNameId);

  const isCurrentUser = useMemo(() => user?.user.id === currentUser?.user.id, [user, currentUser]);

  const profile = user?.user.profile;

  const skills = profile?.tagsets?.find(({ name }) => name === TAGSET_NAME);

  const userId = user?.user.id;

  const [sendMessageToUser] = useSendMessageToUserMutation();

  const handleSendMessage = useCallback(
    async (messageText: string) => {
      if (!userId) {
        throw new Error('User not loaded.');
      }

      await sendMessageToUser({
        variables: {
          messageData: {
            message: messageText,
            receiverIds: [userId],
          },
        },
      });
    },
    [sendMessageToUser, userId]
  );

  const [isMessageUserDialogOpen, setIsMessageUserDialogOpen] = useState(false);

  const closeMessageUserDialog = () => setIsMessageUserDialogOpen(false);
  const openMessageUserDialog = () => setIsMessageUserDialogOpen(true);

  const { t } = useTranslation();

  const messageReceivers = useMemo(() => {
    if (!userId) {
      return;
    }

    return [
      {
        id: userId,
        displayName: profile?.displayName,
        avatarUri: profile?.visual?.uri,
        city: profile?.location?.city,
        country: profile?.location?.country,
      },
    ];
  }, [userId, profile]);

  return (
    <>
      <PageBanner
        banner={banner}
        cardComponent={PageBannerCardWithVisual}
        visual={<SizeableAvatar src={user?.user.profile.visual?.uri} />}
        header={
          <>
            <PageTitle color="primary" noWrap>
              {user?.user.profile.displayName}
            </PageTitle>
            {profile?.location && <LocationCaption {...profile?.location} />}
            <Actions gap={0}>
              <IconButton size="small" onClick={openMessageUserDialog}>
                <MailOutlined />
              </IconButton>
              {isCurrentUser && (
                <IconButton
                  size="small"
                  component={RouterLink}
                  to={user ? buildUserProfileSettingsUrl(user?.user.nameID) : ''}
                >
                  <SettingsOutlined />
                </IconButton>
              )}
            </Actions>
          </>
        }
        subtitle={user?.user.profile.tagline}
        tags={skills?.tags}
        loading={loading}
      />
      <DirectMessageDialog
        title={t('send-message-dialog.direct-message-title')}
        open={isMessageUserDialogOpen}
        onClose={closeMessageUserDialog}
        onSendMessage={handleSendMessage}
        messageReceivers={messageReceivers}
      />
    </>
  );
};

export default UserPageBanner;
