import React, { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { journeyCardTagsGetter, journeyCardValueGetter } from '../../common/utils/journeyCardValueGetter';
import { buildOpportunityUrl } from '../../../../main/routing/urlBuilders';
import { JourneyCreationDialog } from '../../../shared/components/JorneyCreationDialog';
import { JourneyFormValues } from '../../../shared/components/JorneyCreationDialog/JourneyCreationForm';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { useJourneyCreation } from '../../../shared/utils/useJourneyCreation/useJourneyCreation';
import ChildJourneyView from '../../common/tabs/Subentities/ChildJourneyView';
import { useSpace } from '../../space/SpaceContext/useSpace';
import { CreateOpportunityForm } from '../../opportunity/forms/CreateOpportunityForm';
import { OpportunityIcon } from '../../opportunity/icon/OpportunityIcon';
import OpportunityCard from '../../opportunity/OpportunityCard/OpportunityCard';
import ChallengeOpportunitiesContainer from '../containers/ChallengeOpportunitiesContainer';
import { useChallenge } from '../hooks/useChallenge';
import ChallengePageLayout from '../layout/ChallengePageLayout';
import CalloutsGroupView from '../../../collaboration/callout/CalloutsInContext/CalloutsGroupView';
import { CalloutDisplayLocation, CommunityMembershipStatus } from '../../../../core/apollo/generated/graphql-schema';

export interface ChallengeOpportunitiesPageProps {}

const ChallengeOpportunitiesPage: FC<ChallengeOpportunitiesPageProps> = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { spaceNameId, visibility } = useSpace();
  const { challengeId, challengeNameId, permissions } = useChallenge();

  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);

  const { createOpportunity } = useJourneyCreation();

  const handleCreate = useCallback(
    async (value: JourneyFormValues) => {
      const result = await createOpportunity({
        challengeID: challengeId,
        displayName: value.displayName,
        tagline: value.tagline,
        vision: value.vision,
        tags: value.tags,
        innovationFlowTemplateID: value.innovationFlowTemplateID,
      });

      if (!result) {
        return;
      }

      // delay the navigation so all other processes related to updating the cache
      // and closing all subscriptions are completed
      setTimeout(() => navigate(buildOpportunityUrl(spaceNameId, challengeNameId, result.nameID)), 100);
    },
    [navigate, createOpportunity, spaceNameId, challengeId, challengeNameId]
  );

  return (
    <ChallengePageLayout currentSection={EntityPageSection.Opportunities}>
      <ChallengeOpportunitiesContainer spaceNameId={spaceNameId} challengeNameId={challengeNameId}>
        {({ callouts, ...entities }, state) => (
          <ChildJourneyView
            spaceNameId={spaceNameId}
            childEntities={entities.opportunities ?? undefined}
            childEntitiesIcon={<OpportunityIcon />}
            childEntityReadAccess
            getChildEntityUrl={entity => buildOpportunityUrl(spaceNameId, challengeNameId, entity.nameID)}
            childEntityValueGetter={journeyCardValueGetter}
            childEntityTagsGetter={journeyCardTagsGetter}
            journeyTypeName="challenge"
            state={{ loading: state.loading, error: state.error }}
            renderChildEntityCard={opportunity => (
              <OpportunityCard
                displayName={opportunity.profile.displayName}
                tagline={opportunity.profile.tagline!}
                vision={opportunity.context?.vision!}
                innovationFlowState={opportunity.innovationFlow?.lifecycle?.state}
                tags={opportunity.profile.tagset?.tags!}
                banner={opportunity.profile.cardBanner}
                journeyUri={buildOpportunityUrl(spaceNameId, challengeNameId, opportunity.nameID)}
                spaceVisibility={visibility}
                member={opportunity.community?.myMembershipStatus === CommunityMembershipStatus.Member}
              />
            )}
            childEntityCreateAccess={permissions.canCreateOpportunity}
            childEntityOnCreate={() => setCreateDialogOpen(true)}
            createSubentityDialog={
              <JourneyCreationDialog
                open={isCreateDialogOpen}
                icon={<OpportunityIcon />}
                journeyName={t('common.opportunity')}
                onClose={() => setCreateDialogOpen(false)}
                OnCreate={handleCreate}
                formComponent={CreateOpportunityForm}
              />
            }
            childrenLeft={
              <CalloutsGroupView
                callouts={callouts.groupedCallouts[CalloutDisplayLocation.OpportunitiesLeft]}
                spaceId={spaceNameId!}
                canCreateCallout={callouts.canCreateCallout}
                loading={callouts.loading}
                journeyTypeName="challenge"
                calloutNames={callouts.calloutNames}
                onSortOrderUpdate={callouts.onCalloutsSortOrderUpdate}
                onCalloutUpdate={callouts.refetchCallout}
                displayLocation={CalloutDisplayLocation.OpportunitiesLeft}
              />
            }
            childrenRight={
              <CalloutsGroupView
                callouts={callouts.groupedCallouts[CalloutDisplayLocation.OpportunitiesRight]}
                spaceId={spaceNameId!}
                canCreateCallout={callouts.canCreateCallout}
                loading={callouts.loading}
                journeyTypeName="challenge"
                calloutNames={callouts.calloutNames}
                onSortOrderUpdate={callouts.onCalloutsSortOrderUpdate}
                onCalloutUpdate={callouts.refetchCallout}
                displayLocation={CalloutDisplayLocation.OpportunitiesRight}
              />
            }
          />
        )}
      </ChallengeOpportunitiesContainer>
    </ChallengePageLayout>
  );
};

export default ChallengeOpportunitiesPage;
