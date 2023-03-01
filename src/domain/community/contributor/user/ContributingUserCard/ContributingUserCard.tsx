import ContributeCard, { ContributeCardContainerProps } from '../../../../../core/ui/card/ContributeCard';
import CardImage from '../../../../../core/ui/card/CardImage';
import { Box, IconButton } from '@mui/material';
import { gutters } from '../../../../../core/ui/grid/utils';
import { BlockTitle } from '../../../../../core/ui/typography';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LocationCardSegment from '../../../../../core/ui/location/LocationCardSegment';
import { DirectMessageDialog } from '../../../../communication/messaging/DirectMessaging/DirectMessageDialog';
import React, { MouseEventHandler, ReactNode, useCallback, useState } from 'react';
import { useSendMessageToUserMutation } from '../../../../../core/apollo/generated/apollo-hooks';
import { useTranslation } from 'react-i18next';
import CardMatchedTerms from '../../../../../core/ui/card/CardMatchedTerms';
import CardTags from '../../../../../core/ui/card/CardTags';
import RouterLink from '../../../../../core/ui/link/RouterLink';
import ExpandableCardFooter from '../../../../../core/ui/card/ExpandableCardFooter';

interface ContributingUserCardProps extends ContributeCardContainerProps {
  id: string;
  displayName: string;
  avatarUri?: string;
  city?: string;
  country?: string;
  tags: string[];
  matchedTerms?: boolean;
  userUri: string;
  actions?: ReactNode;
}

const ContributingUserCard = ({
  id,
  displayName,
  avatarUri,
  city,
  country,
  tags,
  matchedTerms,
  userUri,
  actions,
  ...containerProps
}: ContributingUserCardProps) => {
  const { t } = useTranslation();

  const [isMessageUserDialogOpen, setIsMessageUserDialogOpen] = useState(false);
  const closeMessageUserDialog = () => setIsMessageUserDialogOpen(false);
  const openMessageUserDialog: MouseEventHandler<HTMLButtonElement> = event => {
    event.stopPropagation();
    setIsMessageUserDialogOpen(true);
  };

  const messageReceivers = [{ title: displayName, avatarUri, city, country }];

  const [sendMessageToUser] = useSendMessageToUserMutation();

  const handleSendMessage = useCallback(
    async (messageText: string) => {
      if (!id) {
        throw new Error('User not loaded.');
      }

      await sendMessageToUser({
        variables: {
          messageData: {
            message: messageText,
            receiverIds: [id],
          },
        },
      });
    },
    [sendMessageToUser, id]
  );

  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpanded = () => setIsExpanded(wasExpanded => !wasExpanded);

  const Tags = matchedTerms ? CardMatchedTerms : CardTags;

  return (
    <>
      <ContributeCard {...containerProps}>
        <Box component={RouterLink} to={userUri}>
          <CardImage src={avatarUri} alt={displayName} />
        </Box>
        <Box onClick={toggleExpanded} sx={{ cursor: 'pointer' }} paddingY={gutters()}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            paddingLeft={gutters()}
            paddingRight={0.5}
            height={gutters()}
          >
            <BlockTitle noWrap>{displayName}</BlockTitle>
            <IconButton onClick={openMessageUserDialog}>
              <EmailOutlinedIcon color="primary" />
            </IconButton>
          </Box>
          <LocationCardSegment city={city} countryCode={country} paddingX={gutters()} marginBottom={gutters()} />
          <ExpandableCardFooter tagsComponent={Tags} tags={tags} expanded={isExpanded} />
        </Box>
      </ContributeCard>
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

export default ContributingUserCard;
