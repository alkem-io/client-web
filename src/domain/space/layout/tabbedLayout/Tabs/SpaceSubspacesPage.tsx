import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSpaceSubspaceCardsQuery } from '@/core/apollo/generated/apollo-hooks';
import { CommunityMembershipStatus, SpaceLevel, SpaceSortMode } from '@/core/apollo/generated/graphql-schema';
import CalloutsGroupView from '@/domain/collaboration/calloutsSet/CalloutsInContext/CalloutsGroupView';
import useCalloutsSet from '@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet';
import useDirectMessageDialog from '@/domain/communication/messaging/DirectMessaging/useDirectMessageDialog';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { spaceAboutTagsGetter, spaceAboutValueGetter } from '@/domain/space/about/util/spaceAboutValueGetter';
import CreateSubspace from '@/domain/space/components/CreateSpace/SubspaceCreationDialog/CreateSubspace';
import type { LeadType } from '@/domain/space/components/cards/components/SpaceLeads';
import SpaceCard from '@/domain/space/components/cards/SpaceCard';
import { useSubspaceCardData } from '@/domain/space/components/cards/utils/useSubspaceCardData';
import SubspacePinIndicator from '@/domain/space/components/SubspacePinIndicator';
import SubspaceView from '@/domain/space/components/subspaces/SubspaceView';
import useSubSpaceCreatedSubscription from '@/domain/space/hooks/useSubSpaceCreatedSubscription';
import useSubspacesSorted from '@/domain/space/hooks/useSubspacesSorted';
import { SpaceL1Icon } from '@/domain/space/icons/SpaceL1Icon';
import { useSpace } from '../../../context/useSpace';
import useSpaceTabProvider from '../SpaceTabProvider';

const SpaceSubspacesPage = () => {
  const { t } = useTranslation();
  const {
    urlInfo,
    flowStateForNewCallouts: flowStateForTab,
    classificationTagsets,
    calloutsSetId,
  } = useSpaceTabProvider({ tabPosition: 2 });

  const { spaceId } = urlInfo;

  const { permissions, visibility } = useSpace();
  const { isAuthenticated } = useCurrentUserContext();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { callouts, canCreateCallout, onCalloutsSortOrderUpdate, refetchCallout } = useCalloutsSet({
    calloutsSetId,
    classificationTagsets,
  });

  const { data, loading, error, subscribeToMore } = useSpaceSubspaceCardsQuery({
    variables: { spaceId: spaceId! },
    skip: !spaceId,
  });

  // @ts-expect-error react-18
  useSubSpaceCreatedSubscription(data, data => data?.lookup.space, subscribeToMore);
  const space = data?.lookup.space;
  const sortMode = space?.settings?.sortMode ?? SpaceSortMode.Alphabetical;

  const subspaces = useSubspacesSorted(space?.subspaces ?? [], sortMode);

  // Use shared hook for parent info and avatar stacking
  const { collectAvatars } = useSubspaceCardData(space);

  const { sendMessage, directMessageDialog } = useDirectMessageDialog({
    dialogTitle: t('send-message-dialog.direct-message-title'),
  });

  const handleContactLead = (leadType: LeadType, leadId: string, leadDisplayName: string, leadAvatarUri?: string) => {
    sendMessage(leadType, {
      id: leadId,
      displayName: leadDisplayName,
      avatarUri: leadAvatarUri,
    });
  };

  const { level, childLevel } = (() => {
    let childLevel = SpaceLevel.L1;

    if (space?.level === SpaceLevel.L1) {
      childLevel = SpaceLevel.L2;
    }

    return {
      level: space?.level ?? SpaceLevel.L0,
      childLevel,
    };
  })();

  return (
    <>
      <SubspaceView
        childEntities={subspaces}
        level={level}
        sortMode={sortMode}
        childEntitiesIcon={<SpaceL1Icon />}
        childEntityValueGetter={spaceAboutValueGetter}
        childEntityTagsGetter={spaceAboutTagsGetter}
        state={{ loading: loading, error: error }}
        renderChildEntityCard={item => (
          <SpaceCard
            spaceId={item.id}
            displayName={item.about.profile.displayName}
            banner={item.about.profile.cardBanner}
            tags={item.about.profile.tagset?.tags ?? []}
            tagline={item.about.profile.tagline ?? ''}
            spaceUri={item.about.profile.url}
            locked={!item.about.isContentPublic}
            isPrivate={!item.about.isContentPublic}
            spaceVisibility={visibility}
            level={childLevel}
            member={item.about.membership.myMembershipStatus === CommunityMembershipStatus.Member}
            leadUsers={item.about.membership?.leadUsers}
            leadOrganizations={item.about.membership?.leadOrganizations}
            showLeads={isAuthenticated}
            onContactLead={handleContactLead}
            avatarUris={collectAvatars(item)}
            iconOverlay={
              sortMode === SpaceSortMode.Alphabetical && item.pinned ? (
                <SubspacePinIndicator withBackground={true} />
              ) : undefined
            }
          />
        )}
        onClickCreate={() => setIsCreateDialogOpen(true)}
        childEntityCreateAccess={permissions.canCreateSubspaces}
        childEntityOnCreate={() => setIsCreateDialogOpen(true)}
        createSubentityDialog={
          <CreateSubspace
            open={isCreateDialogOpen}
            onClose={() => setIsCreateDialogOpen(false)}
            parentSpaceId={spaceId}
          />
        }
      >
        <CalloutsGroupView
          calloutsSetId={calloutsSetId}
          createInFlowState={flowStateForTab?.displayName}
          callouts={callouts}
          canCreateCallout={canCreateCallout}
          loading={loading}
          onSortOrderUpdate={onCalloutsSortOrderUpdate}
          onCalloutUpdate={refetchCallout}
          defaultTemplateId={flowStateForTab?.defaultCalloutTemplate?.id}
        />
      </SubspaceView>
      {directMessageDialog}
    </>
  );
};

export default SpaceSubspacesPage;
