import { useCallback } from 'react';
import { useSpaceSubspaceCardsQuery } from '@/core/apollo/generated/apollo-hooks';
import { CommunityMembershipStatus } from '@/core/apollo/generated/graphql-schema';
import { CardLayoutContainer } from '@/domain/collaboration/callout/components/CardsLayout';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import Loading from '@/core/ui/loading/Loading';
import SpaceFilter from '@/domain/space/components/SpaceFilter';
import { spaceAboutValueGetter } from '@/domain/space/about/util/spaceAboutValueGetter';
import { useSpace } from '@/domain/space/context/useSpace';
import { DialogContent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SpaceCard from './cards/SpaceCard';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { useSubspaceCardData } from './cards/utils/useSubspaceCardData';
import useDirectMessageDialog from '@/domain/communication/messaging/DirectMessaging/useDirectMessageDialog';
import { LeadType } from './cards/components/SpaceLeads';
export interface SubspacesListDialogProps {
  open?: boolean;
  onClose?: () => void;
}
const SubspacesListDialog = ({ open = false, onClose }: SubspacesListDialogProps) => {
  const { t } = useTranslation();
  const { spaceId } = useUrlResolver();
  const { isAuthenticated } = useCurrentUserContext();
  const { visibility } = useSpace();
  const { data, loading } = useSpaceSubspaceCardsQuery({
    variables: { spaceId: spaceId! },
    skip: !spaceId,
  });
  const space = data?.lookup.space;
  const subspaces = space?.subspaces ?? [];
  // Use shared hook for parent info and avatar stacking
  const { parentInfo, collectAvatars } = useSubspaceCardData(space);

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

  return (
    <>
      <DialogWithGrid open={open} fullWidth columns={12} aria-labelledby="subspaces-list-dialog" onClose={onClose}>
        <>
          <DialogHeader
            id="subspaces-list-dialog"
            onClose={onClose}
            title={t('common.entitiesWithCount', {
              entityType: t('common.subspaces'),
              count: subspaces.length,
            })}
          />
          <DialogContent>
            {loading && <Loading />}
            {!loading && subspaces.length > 0 && (
              <SpaceFilter data={subspaces} valueGetter={spaceAboutValueGetter}>
                {filteredEntities => (
                  <CardLayoutContainer>
                    {filteredEntities.map((subspace, index) => {
                      const key = subspace ? subspace.id : `__loading_${index}`;
                      return (
                        <SpaceCard
                          key={key}
                          displayName={subspace.about.profile.displayName}
                          banner={subspace.about.profile.cardBanner}
                          tags={subspace.about.profile.tagset?.tags!}
                          tagline={subspace.about.profile.tagline ?? ''}
                          spaceUri={subspace.about.profile.url}
                          isPrivate={!subspace.about.isContentPublic}
                          spaceVisibility={visibility}
                          level={subspace.level}
                          member={subspace.about.membership.myMembershipStatus === CommunityMembershipStatus.Member}
                          leadUsers={subspace.about.membership?.leadUsers}
                          leadOrganizations={subspace.about.membership?.leadOrganizations}
                          showLeads={isAuthenticated}
                          onContactLead={handleContactLead}
                          parentInfo={parentInfo}
                          avatarUris={collectAvatars(subspace)}
                        />
                      );
                    })}
                  </CardLayoutContainer>
                )}
              </SpaceFilter>
            )}
          </DialogContent>
        </>
      </DialogWithGrid>
      {directMessageDialog}
    </>
  );
};

export default SubspacesListDialog;
