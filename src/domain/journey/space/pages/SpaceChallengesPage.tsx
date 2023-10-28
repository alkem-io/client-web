import React, { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { journeyCardTagsGetter, journeyCardValueGetter } from '../../common/utils/journeyCardValueGetter';
import { buildChallengeUrl } from '../../../../main/routing/urlBuilders';
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
import { CalloutDisplayLocation, CommunityMembershipStatus } from '../../../../core/apollo/generated/graphql-schema';

export interface SpaceChallengesPageProps {}

const SpaceChallengesPage: FC<SpaceChallengesPageProps> = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { spaceNameId, permissions, visibility } = useSpace();

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
        innovationFlowTemplateID: value.innovationFlowTemplateID,
      });

      if (!result) {
        return;
      }
      // delay the navigation so all other processes related to updating the cache,
      // before closing the all subscriptions are completed
      setTimeout(() => navigate(buildChallengeUrl(spaceNameId, result.nameID)), 100);
    },
    [navigate, createChallenge, spaceNameId]
  );

  return (
    <SpacePageLayout currentSection={EntityPageSection.Challenges}>
      <SpaceChallengesContainer spaceNameId={spaceNameId}>
        {({ callouts, ...entities }, state) => (
          <ChildJourneyView
            spaceNameId={spaceNameId}
            childEntities={entities.challenges}
            childEntitiesIcon={<ChallengeIcon />}
            childEntityReadAccess={permissions.canReadChallenges}
            childEntityValueGetter={journeyCardValueGetter}
            childEntityTagsGetter={journeyCardTagsGetter}
            getChildEntityUrl={entity => buildChallengeUrl(spaceNameId, entity.nameID)}
            journeyTypeName="space"
            state={{ loading: state.loading, error: state.error }}
            renderChildEntityCard={challenge => (
              <ChallengeCard
                displayName={challenge.profile.displayName}
                banner={challenge.profile.cardBanner}
                tags={challenge.profile.tagset?.tags!}
                tagline={challenge.profile.tagline!}
                vision={challenge.context?.vision!}
                innovationFlowState={challenge.innovationFlow?.lifecycle?.state}
                journeyUri={buildChallengeUrl(spaceNameId, challenge.nameID)}
                locked={!challenge.authorization?.anonymousReadAccess}
                spaceLicense={visibility}
                member={challenge.community?.myMembershipStatus === CommunityMembershipStatus.Member}
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
                callouts={callouts.groupedCallouts[CalloutDisplayLocation.ChallengesLeft]}
                spaceId={spaceNameId}
                canCreateCallout={callouts.canCreateCallout}
                loading={callouts.loading}
                journeyTypeName="space"
                calloutNames={callouts.calloutNames}
                onSortOrderUpdate={callouts.onCalloutsSortOrderUpdate}
                onCalloutUpdate={callouts.refetchCallout}
                displayLocation={CalloutDisplayLocation.ChallengesLeft}
              />
            }
            childrenRight={
              <CalloutsGroupView
                callouts={callouts.groupedCallouts[CalloutDisplayLocation.ChallengesRight]}
                spaceId={spaceNameId}
                canCreateCallout={callouts.canCreateCallout}
                loading={callouts.loading}
                journeyTypeName="space"
                calloutNames={callouts.calloutNames}
                onSortOrderUpdate={callouts.onCalloutsSortOrderUpdate}
                onCalloutUpdate={callouts.refetchCallout}
                displayLocation={CalloutDisplayLocation.ChallengesRight}
              />
            }
          />
        )}
      </SpaceChallengesContainer>
    </SpacePageLayout>
  );
};

export default SpaceChallengesPage;
