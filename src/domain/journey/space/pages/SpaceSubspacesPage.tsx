import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useNavigate from '@/core/routing/useNavigate';
import { journeyCardTagsGetter, journeyCardValueGetter } from '@/domain/journey/common/utils/journeyCardValueGetter';
import { JourneyCreationDialog } from '@/domain/shared/components/JourneyCreationDialog/JourneyCreationDialog';
import { JourneyFormValues } from '@/domain/shared/components/JourneyCreationDialog/JourneyCreationForm';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import { useSubspaceCreation } from '@/domain/shared/utils/useSubspaceCreation/useSubspaceCreation';
import ChildJourneyView from '@/domain/journey/common/tabs/Subentities/ChildJourneyView';
import SubspacesContainer from '../containers/SubspacesContainer';
import { useSpace } from '../SpaceContext/useSpace';
import SpacePageLayout from '../layout/SpacePageLayout';
import CalloutsGroupView from '@/domain/collaboration/calloutsSet/CalloutsInContext/CalloutsGroupView';
import { CalloutGroupName, CommunityMembershipStatus, SpacePrivacyMode } from '@/core/apollo/generated/graphql-schema';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { SubspaceIcon } from '@/domain/journey/subspace/icon/SubspaceIcon';
import SubspaceCard from '@/domain/journey/subspace/subspaceCard/SubspaceCard';
import { CreateSubspaceForm } from '@/domain/journey/subspace/forms/CreateSubspaceForm';
import SubspaceIcon2 from '@/domain/journey/subspace/icon/SubspaceIcon2';
import useCalloutsOnCollaboration from '@/domain/collaboration/useCalloutsOnCollaboration';

const SpaceSubspacesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { spaceId, journeyPath, collaborationId, calloutsSetId } = useUrlResolver();
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
        displayName: value.displayName,
        tagline: value.tagline,
        background: value.background ?? '',
        vision: value.vision,
        tags: value.tags,
        addTutorialCallouts: value.addTutorialCallouts,
        collaborationTemplateId: value.collaborationTemplateId,
        visuals: value.visuals,
      });

      if (!result) {
        return;
      }

      navigate(result.profile.url);
    },
    [navigate, createSubspace, spaceId]
  );

  const callouts = useCalloutsOnCollaboration({
    collaborationId,
    groupNames: [CalloutGroupName.Subspaces],
  });

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
                displayName={item.profile.displayName}
                banner={item.profile.cardBanner}
                tags={item.profile.tagset?.tags!}
                tagline={item.profile.tagline!}
                vision={item.context?.vision!}
                journeyUri={item.profile.url}
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
                callouts={callouts.groupedCallouts[CalloutGroupName.Subspaces]}
                canCreateCallout={callouts.canCreateCallout}
                loading={callouts.loading}
                onSortOrderUpdate={callouts.onCalloutsSortOrderUpdate}
                onCalloutUpdate={callouts.refetchCallout}
                groupName={CalloutGroupName.Subspaces}
              />
            }
          />
        )}
      </SubspacesContainer>
    </SpacePageLayout>
  );
};

export default SpaceSubspacesPage;
