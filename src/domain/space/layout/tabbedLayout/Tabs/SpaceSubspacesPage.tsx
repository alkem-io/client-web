import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useNavigate from '@/core/routing/useNavigate';
import { SubspaceCreationDialog } from '@/domain/space/components/CreateSpace/SubspaceCreationDialog/SubspaceCreationDialog';
import { SpaceFormValues } from '@/domain/space/components/CreateSpace/SubspaceCreationDialog/SubspaceCreationForm';
import { CreateSubspaceForm } from '@/domain/space/components/CreateSpace/SubspaceCreationDialog/CreateSubspaceForm';
import { useSubspaceCreation } from '@/domain/space/components/CreateSpace/hooks/useSubspaceCreation/useSubspaceCreation';
import { useSpace } from '../../../context/useSpace';
import CalloutsGroupView from '@/domain/collaboration/calloutsSet/CalloutsInContext/CalloutsGroupView';
import { CommunityMembershipStatus, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { SpaceL1Icon } from '@/domain/space/icons/SpaceL1Icon';
import SpaceL1Icon2 from '@/domain/space/icons/SpaceL1Icon2';
import useSpaceTabProvider from '../SpaceTabProvider';
import useCalloutsSet from '@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet';
import { useSpaceSubspaceCardsQuery } from '@/core/apollo/generated/apollo-hooks';
import useSubSpaceCreatedSubscription from '@/domain/space/hooks/useSubSpaceCreatedSubscription';
import SubspaceCard from '@/domain/space/components/cards/SubspaceCard';
import { spaceAboutTagsGetter, spaceAboutValueGetter } from '@/domain/space/about/util/spaceAboutValueGetter';
import SubspaceView from '@/domain/space/components/subspaces/SubspaceView';

const SpaceSubspacesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    urlInfo,
    flowStateForNewCallouts: flowStateForTab,
    classificationTagsets,
    calloutsSetId,
  } = useSpaceTabProvider({ tabPosition: 2 });

  const { spaceId } = urlInfo;

  const { permissions, visibility } = useSpace();

  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);

  const { createSubspace } = useSubspaceCreation();

  const handleCreate = useCallback(
    async (value: SpaceFormValues) => {
      if (!spaceId) {
        return;
      }
      const result = await createSubspace({
        spaceID: spaceId,
        about: {
          profile: {
            displayName: value.displayName,
            description: value.description,
            tagline: value.tagline,
            visuals: value.visuals,
            tags: value.tags,
          },
          why: value.why,
        },
        addTutorialCallouts: value.addTutorialCallouts,
        addCallouts: value.addCallouts,
        spaceTemplateId: value.spaceTemplateId,
      });

      if (!result) {
        return;
      }

      navigate(result.about.profile?.url!);
    },
    [navigate, createSubspace, spaceId]
  );
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
    <SubspaceView
      childEntities={subspaces}
      level={level}
      childEntitiesIcon={<SpaceL1Icon />}
      childEntityValueGetter={spaceAboutValueGetter}
      childEntityTagsGetter={spaceAboutTagsGetter}
      state={{ loading: loading, error: error }}
      renderChildEntityCard={item => (
        <SubspaceCard
          displayName={item.about.profile.displayName}
          banner={item.about.profile.cardBanner}
          tags={item.about.profile.tagset?.tags!}
          tagline={item.about.profile.tagline!}
          vision={item.about.why!}
          spaceUri={item.about.profile.url}
          locked={!item.about.isContentPublic}
          spaceVisibility={visibility}
          level={childLevel}
          member={item.about.membership.myMembershipStatus === CommunityMembershipStatus.Member}
        />
      )}
      onClickCreate={() => setCreateDialogOpen(true)}
      childEntityCreateAccess={permissions.canCreateSubspaces}
      childEntityOnCreate={() => setCreateDialogOpen(true)}
      createSubentityDialog={
        <SubspaceCreationDialog
          open={isCreateDialogOpen}
          icon={<SpaceL1Icon2 fill="primary" />}
          spaceDisplayName={t('common.subspace')}
          onClose={() => setCreateDialogOpen(false)}
          onCreate={handleCreate}
          formComponent={CreateSubspaceForm}
        />
      }
      children={
        <CalloutsGroupView
          calloutsSetId={calloutsSetId}
          createInFlowState={flowStateForTab?.displayName}
          callouts={callouts}
          canCreateCallout={canCreateCallout}
          loading={loading}
          onSortOrderUpdate={onCalloutsSortOrderUpdate}
          onCalloutUpdate={refetchCallout}
        />
      }
    />
  );
};

export default SpaceSubspacesPage;
