import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSpace } from '../../../context/useSpace';
import CalloutsGroupView from '@/domain/collaboration/calloutsSet/CalloutsInContext/CalloutsGroupView';
import { CommunityMembershipStatus, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { SpaceL1Icon } from '@/domain/space/icons/SpaceL1Icon';
import useSpaceTabProvider from '../SpaceTabProvider';
import useCalloutsSet from '@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet';
import { useSpaceSubspaceCardsQuery } from '@/core/apollo/generated/apollo-hooks';
import useSubSpaceCreatedSubscription from '@/domain/space/hooks/useSubSpaceCreatedSubscription';
import SpaceCard from '@/domain/space/components/cards/SpaceCard';
import { spaceAboutTagsGetter, spaceAboutValueGetter } from '@/domain/space/about/util/spaceAboutValueGetter';
import SubspaceView from '@/domain/space/components/subspaces/SubspaceView';
import CreateSubspace from '@/domain/space/components/CreateSpace/SubspaceCreationDialog/CreateSubspace';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { useSubspaceCardData } from '@/domain/space/components/cards/utils/useSubspaceCardData';
import useDirectMessageDialog from '@/domain/communication/messaging/DirectMessaging/useDirectMessageDialog';
import { LeadType } from '@/domain/space/components/cards/components/SpaceLeads';

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

  // @ts-ignore react-18
  useSubSpaceCreatedSubscription(data, data => data?.lookup.space, subscribeToMore);
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

  const { level, childLevel } = useMemo(() => {
    let childLevel = SpaceLevel.L1;

    if (space?.level === SpaceLevel.L1) {
      childLevel = SpaceLevel.L2;
    }

    return {
      level: space?.level ?? SpaceLevel.L0,
      childLevel,
    };
  }, [space?.level]);

  return (
    <>
      <SubspaceView
        childEntities={subspaces}
        level={level}
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
            parentInfo={parentInfo}
            avatarUris={collectAvatars(item)}
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
        />
      </SubspaceView>
      {directMessageDialog}
    </>
  );
};

export default SpaceSubspacesPage;
