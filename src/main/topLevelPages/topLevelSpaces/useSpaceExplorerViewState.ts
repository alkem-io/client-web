import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSpaceExplorerWelcomeSpaceQuery, useSpaceUrlResolverQuery } from '@/core/apollo/generated/apollo-hooks';
import useDirectMessageDialog from '@/domain/communication/messaging/DirectMessaging/useDirectMessageDialog';
import type { LeadType } from '@/domain/space/components/cards/components/SpaceLeads';

export const useSpaceExplorerViewState = () => {
  const { t } = useTranslation();

  const { sendMessage, directMessageDialog } = useDirectMessageDialog({
    dialogTitle: t('send-message-dialog.direct-message-title'),
  });

  const handleContactLead = useCallback(
    (leadType: LeadType, leadId: string, leadDisplayName: string, leadAvatarUri?: string) => {
      sendMessage(leadType, {
        id: leadId,
        displayName: leadDisplayName,
        avatarUri: leadAvatarUri,
      });
    },
    [sendMessage]
  );

  const spaceNameId = t('pages.home.sections.membershipSuggestions.suggestedSpace.nameId');
  const { data: spaceIdData } = useSpaceUrlResolverQuery({
    variables: { spaceNameId },
    skip: !spaceNameId,
  });
  const welcomeSpaceId = spaceIdData?.lookupByName.space?.id;

  const { data: spaceExplorerData } = useSpaceExplorerWelcomeSpaceQuery({
    variables: { spaceId: welcomeSpaceId! },
    skip: !welcomeSpaceId,
  });
  const welcomeSpace = spaceExplorerData?.lookup.space;

  return {
    handleContactLead,
    directMessageDialog,
    welcomeSpace,
  };
};
