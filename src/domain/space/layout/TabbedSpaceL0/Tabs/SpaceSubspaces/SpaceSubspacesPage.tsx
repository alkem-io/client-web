import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useNavigate from '@/core/routing/useNavigate';
import { journeyCardTagsGetter, journeyCardValueGetter } from '@/domain/journey/common/utils/journeyCardValueGetter';
import { JourneyCreationDialog } from '@/domain/shared/components/JourneyCreationDialog/JourneyCreationDialog';
import { JourneyFormValues } from '@/domain/shared/components/JourneyCreationDialog/JourneyCreationForm';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import { useSubspaceCreation } from '@/domain/shared/utils/useSubspaceCreation/useSubspaceCreation';
import ChildJourneyView from '@/domain/journey/common/tabs/Subentities/ChildJourneyView';
import SubspacesContainer from '../../../../../journey/space/containers/SubspacesContainer';
import { useSpace } from '../../../../../journey/space/SpaceContext/useSpace';
import SpacePageLayout from '../../../../../journey/space/layout/SpacePageLayout';
import CalloutsGroupView from '@/domain/collaboration/calloutsSet/CalloutsInContext/CalloutsGroupView';
import { CommunityMembershipStatus, SpacePrivacyMode } from '@/core/apollo/generated/graphql-schema';
import { SubspaceIcon } from '@/domain/journey/subspace/icon/SubspaceIcon';
import SubspaceCard from '@/domain/journey/subspace/subspaceCard/SubspaceCard';
import { CreateSubspaceForm } from '@/domain/journey/subspace/forms/CreateSubspaceForm';
import SubspaceIcon2 from '@/domain/journey/subspace/icon/SubspaceIcon2';
import useSpaceTabProvider from '../../SpaceTabProvider';
import useCalloutsSet from '@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet';
import useAboutRedirect from '@/core/routing/useAboutRedirect';

const SpaceSubspacesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    urlInfo,
    flowStateForNewCallouts: flowStateForTab,
    classificationTagsets,
    calloutsSetId,
    canSaveAsTemplate,
    entitledToSaveAsTemplate,
  } = useSpaceTabProvider({ tabPosition: 2 });
  const { spaceId, journeyPath } = urlInfo;
  const { permissions, visibility } = useSpace();

  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);

  const { createSubspace } = useSubspaceCreation();

  const handleCreate = useCallback(
    async (value: JourneyFormValues) => {
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
        collaborationTemplateId: value.collaborationTemplateId,
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
    canSaveAsTemplate,
    entitledToSaveAsTemplate,
    includeClassification: true,
  });

  const loading = false;
  useAboutRedirect({ spaceId, currentSection: EntityPageSection.Subspaces, skip: loading || !spaceId });

  return (
    <SpacePageLayout journeyPath={journeyPath} currentSection={EntityPageSection.Subspaces}>
      <SubspacesContainer spaceId={spaceId}>
        {({ subspaces, level }, state) => (
          <ChildJourneyView
            childEntities={subspaces}
            level={level}
            childEntitiesIcon={<SubspaceIcon />}
            childEntityReadAccess={permissions.canReadSubspaces}
            childEntityValueGetter={journeyCardValueGetter}
            childEntityTagsGetter={journeyCardTagsGetter}
            state={{ loading: state.loading, error: state.error }}
            renderChildEntityCard={item => (
              <SubspaceCard
                displayName={item.about.profile.displayName}
                banner={item.about.profile.cardBanner}
                tags={item.about.profile.tagset?.tags!}
                tagline={item.about.profile.tagline!}
                vision={item.about.why!}
                journeyUri={item.about.profile.url}
                locked={item.settings.privacy?.mode === SpacePrivacyMode.Private}
                spaceVisibility={visibility}
                member={item.community?.roleSet?.myMembershipStatus === CommunityMembershipStatus.Member}
              />
            )}
            onClickCreate={() => setCreateDialogOpen(true)}
            childEntityCreateAccess={permissions.canCreateSubspaces}
            childEntityOnCreate={() => setCreateDialogOpen(true)}
            createSubentityDialog={
              <JourneyCreationDialog
                open={isCreateDialogOpen}
                icon={<SubspaceIcon2 fill="primary" />}
                journeyName={t('common.subspace')}
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
        )}
      </SubspacesContainer>
    </SpacePageLayout>
  );
};

export default SpaceSubspacesPage;
