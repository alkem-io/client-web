import React, { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useNavigate from '../../../../core/routing/useNavigate';
import { journeyCardTagsGetter, journeyCardValueGetter } from '../../common/utils/journeyCardValueGetter';
import { JourneyCreationDialog } from '../../../shared/components/JorneyCreationDialog';
import { JourneyFormValues } from '../../../shared/components/JorneyCreationDialog/JourneyCreationForm';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { useJourneyCreation } from '../../../shared/utils/useJourneyCreation/useJourneyCreation';
import ChallengeCard from '../../challenge/ChallengeCard/ChallengeCard';
import { CreateChallengeForm } from '../../challenge/forms/CreateChallengeForm';
import { ChallengeIcon } from '../../challenge/icon/ChallengeIcon';
import ChildJourneyView from '../../common/tabs/Subentities/ChildJourneyView';
import SpaceChallengesContainer from '../containers/SpaceChallengesContainer';
import { useSpace } from '../SpaceContext/useSpace';
import SpacePageLayout from '../layout/SpacePageLayout';
import CalloutsGroupView from '../../../collaboration/callout/CalloutsInContext/CalloutsGroupView';
import { CalloutGroupName, CommunityMembershipStatus } from '../../../../core/apollo/generated/graphql-schema';
import { useRouteResolver } from '../../../../main/routing/resolvers/RouteResolver';

export interface SpaceChallengesPageProps {}

const SpaceChallengesPage: FC<SpaceChallengesPageProps> = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { spaceId } = useRouteResolver();
  const { spaceNameId, permissions, license } = useSpace();
  const spaceVisibility = license.visibility;

  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);

  const { createChallenge } = useJourneyCreation();

  const handleCreate = useCallback(
    async (value: JourneyFormValues) => {
      const result = await createChallenge({
        spaceID: spaceNameId,
        displayName: value.displayName,
        tagline: value.tagline,
        background: value.background ?? '',
        vision: value.vision,
        tags: value.tags,
        addDefaultCallouts: value.addDefaultCallouts,
      });

      if (!result) {
        return;
      }

      navigate(result.profile.url);
    },
    [navigate, createChallenge, spaceNameId]
  );

  return (
    <SpacePageLayout currentSection={EntityPageSection.Challenges}>
      <SpaceChallengesContainer spaceId={spaceId}>
        {({ callouts, ...entities }, state) => (
          <ChildJourneyView
            childEntities={entities.challenges}
            childEntitiesIcon={<ChallengeIcon />}
            childEntityReadAccess={permissions.canReadChallenges}
            childEntityValueGetter={journeyCardValueGetter}
            childEntityTagsGetter={journeyCardTagsGetter}
            journeyTypeName="space"
            state={{ loading: state.loading, error: state.error }}
            renderChildEntityCard={challenge => (
              <ChallengeCard
                displayName={challenge.profile.displayName}
                banner={challenge.profile.cardBanner}
                tags={challenge.profile.tagset?.tags!}
                tagline={challenge.profile.tagline!}
                vision={challenge.context?.vision!}
                journeyUri={challenge.profile.url}
                locked={!challenge.authorization?.anonymousReadAccess}
                spaceVisibility={spaceVisibility}
                member={challenge.community?.myMembershipStatus === CommunityMembershipStatus.Member}
                openCreateDialog={() => setCreateDialogOpen(true)}
              />
            )}
            childEntityCreateAccess={permissions.canCreateChallenges}
            childEntityOnCreate={() => setCreateDialogOpen(true)}
            createSubentityDialog={
              <JourneyCreationDialog
                open={isCreateDialogOpen}
                icon={<ChallengeIcon />}
                journeyName={t('common.challenge')}
                onClose={() => setCreateDialogOpen(false)}
                OnCreate={handleCreate}
                formComponent={CreateChallengeForm}
              />
            }
            childrenLeft={
              <CalloutsGroupView
                callouts={callouts.groupedCallouts[CalloutGroupName.Subspaces_1]}
                canCreateCallout={callouts.canCreateCallout}
                canCreateCalloutFromTemplate={callouts.canCreateCalloutFromTemplate}
                loading={callouts.loading}
                journeyTypeName="space"
                calloutNames={callouts.calloutNames}
                onSortOrderUpdate={callouts.onCalloutsSortOrderUpdate}
                onCalloutUpdate={callouts.refetchCallout}
                groupName={CalloutGroupName.Subspaces_1}
              />
            }
            childrenRight={
              <CalloutsGroupView
                callouts={callouts.groupedCallouts[CalloutGroupName.Subspaces_2]}
                canCreateCallout={callouts.canCreateCallout}
                canCreateCalloutFromTemplate={callouts.canCreateCalloutFromTemplate}
                loading={callouts.loading}
                journeyTypeName="space"
                calloutNames={callouts.calloutNames}
                onSortOrderUpdate={callouts.onCalloutsSortOrderUpdate}
                onCalloutUpdate={callouts.refetchCallout}
                groupName={CalloutGroupName.Subspaces_2}
              />
            }
          />
        )}
      </SpaceChallengesContainer>
    </SpacePageLayout>
  );
};

export default SpaceChallengesPage;
