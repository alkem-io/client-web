import React, { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useNavigate from '../../../../core/routing/useNavigate';
import { journeyCardTagsGetter, journeyCardValueGetter } from '../../common/utils/journeyCardValueGetter';
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
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { CalloutGroupName, CommunityMembershipStatus } from '../../../../core/apollo/generated/graphql-schema';

export interface ChallengeOpportunitiesPageProps {}

const ChallengeOpportunitiesPage: FC<ChallengeOpportunitiesPageProps> = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { spaceNameId, license } = useSpace();
  const spaceVisibility = license.visibility;
  const { challengeId, permissions } = useChallenge();
  const { challengeNameId = '' } = useUrlParams();

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
        addDefaultCallouts: value.addDefaultCallouts,
      });

      if (!result) {
        return;
      }

      navigate(result.profile.url);
    },
    [navigate, createOpportunity, spaceNameId, challengeId, challengeNameId]
  );

  return (
    <ChallengePageLayout currentSection={EntityPageSection.Opportunities}>
      <ChallengeOpportunitiesContainer challengeId={challengeId}>
        {({ callouts, ...entities }, state) => (
          <ChildJourneyView
            childEntities={entities.opportunities ?? undefined}
            childEntitiesIcon={<OpportunityIcon />}
            childEntityReadAccess
            childEntityValueGetter={journeyCardValueGetter}
            childEntityTagsGetter={journeyCardTagsGetter}
            journeyTypeName="challenge"
            state={{ loading: state.loading, error: state.error }}
            renderChildEntityCard={opportunity => (
              <OpportunityCard
                displayName={opportunity.profile.displayName}
                tagline={opportunity.profile.tagline!}
                vision={opportunity.context?.vision!}
                innovationFlowState={opportunity.collaboration?.innovationFlow?.currentState.displayName}
                tags={opportunity.profile.tagset?.tags!}
                banner={opportunity.profile.cardBanner}
                journeyUri={opportunity.profile.url}
                spaceVisibility={spaceVisibility}
                member={opportunity.community?.myMembershipStatus === CommunityMembershipStatus.Member}
              />
            )}
            childEntityCreateAccess={permissions.canCreateSubspace}
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
                callouts={callouts.groupedCallouts[CalloutGroupName.Subspaces_1]}
                canCreateCallout={callouts.canCreateCallout}
                canCreateCalloutFromTemplate={callouts.canCreateCalloutFromTemplate}
                loading={callouts.loading}
                journeyTypeName="challenge"
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
                journeyTypeName="challenge"
                calloutNames={callouts.calloutNames}
                onSortOrderUpdate={callouts.onCalloutsSortOrderUpdate}
                onCalloutUpdate={callouts.refetchCallout}
                groupName={CalloutGroupName.Subspaces_2}
              />
            }
          />
        )}
      </ChallengeOpportunitiesContainer>
    </ChallengePageLayout>
  );
};

export default ChallengeOpportunitiesPage;
