import React, { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useNavigate from '@/core/routing/useNavigate';
import { journeyCardTagsGetter, journeyCardValueGetter } from '../../common/utils/journeyCardValueGetter';
import { JourneyCreationDialog } from '../../../shared/components/JorneyCreationDialog';
import { JourneyFormValues } from '../../../shared/components/JorneyCreationDialog/JourneyCreationForm';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { useSubspaceCreation } from '../../../shared/utils/useJourneyCreation/useJourneyCreation';
import ChildJourneyView from '../../common/tabs/Subentities/ChildJourneyView';
import SubspacesContainer from '../containers/SubspacesContainer';
import { useSpace } from '../SpaceContext/useSpace';
import SpacePageLayout from '../layout/SpacePageLayout';
import CalloutsGroupView from '../../../collaboration/callout/CalloutsInContext/CalloutsGroupView';
import { CalloutGroupName, CommunityMembershipStatus, SpacePrivacyMode } from '@/core/apollo/generated/graphql-schema';
import { useRouteResolver } from '../../../../main/routing/resolvers/RouteResolver';
import { SubspaceIcon } from '../../subspace/icon/SubspaceIcon';
import SubspaceCard from '../../subspace/subspaceCard/SubspaceCard';
import { CreateSubspaceForm } from '../../subspace/forms/CreateSubspaceForm';
import useCallouts from '../../../collaboration/callout/useCallouts/useCallouts';

export interface SpaceSubspacesPageProps {}

const SpaceSubspacesPage: FC<SpaceSubspacesPageProps> = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { spaceId, journeyPath } = useRouteResolver();
  const { spaceNameId, permissions, visibility, collaborationId } = useSpace();

  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);

  const { createSubspace } = useSubspaceCreation();

  const handleCreate = useCallback(
    async (value: JourneyFormValues) => {
      const result = await createSubspace({
        spaceID: spaceNameId,
        displayName: value.displayName,
        tagline: value.tagline,
        background: value.background ?? '',
        vision: value.vision,
        tags: value.tags,
        addTutorialCallouts: value.addTutorialCallouts,
        addCallouts: value.addCallouts,
      });

      if (!result) {
        return;
      }

      navigate(result.profile.url);
    },
    [navigate, createSubspace, spaceNameId]
  );

  const callouts = useCallouts({
    collaborationId,
    journeyTypeName: 'space',
    canReadCollaboration: true,
    groupNames: [CalloutGroupName.Subspaces],
  });

  return (
    <SpacePageLayout journeyPath={journeyPath} currentSection={EntityPageSection.Subspaces}>
      <SubspacesContainer spaceId={spaceId}>
        {({ subspaces }, state) => (
          <ChildJourneyView
            childEntities={subspaces}
            childEntitiesIcon={<SubspaceIcon />}
            childEntityReadAccess={permissions.canReadSubspaces}
            childEntityValueGetter={journeyCardValueGetter}
            childEntityTagsGetter={journeyCardTagsGetter}
            journeyTypeName="space"
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
                icon={<SubspaceIcon />}
                journeyName={t('common.subspace')}
                onClose={() => setCreateDialogOpen(false)}
                onCreate={handleCreate}
                formComponent={CreateSubspaceForm}
              />
            }
            children={
              <CalloutsGroupView
                journeyId={spaceId}
                collaborationId={collaborationId}
                callouts={callouts.groupedCallouts[CalloutGroupName.Subspaces]}
                canCreateCallout={callouts.canCreateCallout}
                loading={callouts.loading}
                journeyTypeName="space"
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
