import React, { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useNavigate from '../../../../core/routing/useNavigate';
import { journeyCardTagsGetter, journeyCardValueGetter } from '../../common/utils/journeyCardValueGetter';
import { JourneyCreationDialog } from '../../../shared/components/JorneyCreationDialog';
import { JourneyFormValues } from '../../../shared/components/JorneyCreationDialog/JourneyCreationForm';
import { useSubspaceCreation } from '../../../shared/utils/useJourneyCreation/useJourneyCreation';
import ChildJourneyView from '../../common/tabs/Subentities/ChildJourneyView';
import { useSpace } from '../../space/SpaceContext/useSpace';
import { CreateOpportunityForm } from '../../opportunity/forms/CreateOpportunityForm';
import { OpportunityIcon } from '../../opportunity/icon/OpportunityIcon';
import SubspaceCard from '../subspaceCard/SubspaceCard';
import ChallengeOpportunitiesContainer from '../containers/SubspaceOpportunitiesContainer';
import { useSubSpace } from '../hooks/useChallenge';
import SubspacePageLayout from '../layout/SubspacePageLayout';
import CalloutsGroupView from '../../../collaboration/callout/CalloutsInContext/CalloutsGroupView';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { CalloutGroupName, CommunityMembershipStatus } from '../../../../core/apollo/generated/graphql-schema';
import { useRouteResolver } from '../../../../main/routing/resolvers/RouteResolver';

export interface ChallengeOpportunitiesPageProps {}

const ChallengeOpportunitiesPage: FC<ChallengeOpportunitiesPageProps> = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { spaceNameId, license } = useSpace();
  const spaceVisibility = license.visibility;
  const { subspaceId: challengeId, permissions } = useSubSpace();
  const { challengeNameId = '' } = useUrlParams();
  const { journeyId, journeyPath } = useRouteResolver();

  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);

  const { createSubspace } = useSubspaceCreation();

  const handleCreate = useCallback(
    async (value: JourneyFormValues) => {
      const result = await createSubspace({
        spaceID: challengeId,
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
    [navigate, createSubspace, spaceNameId, challengeId, challengeNameId]
  );

  return (
    <SubspacePageLayout journeyId={journeyId} journeyPath={journeyPath}>
      <ChallengeOpportunitiesContainer challengeId={challengeId}>
        {({ callouts, ...entities }, state) => (
          <ChildJourneyView
            childEntities={entities.subsubspaces ?? undefined}
            childEntitiesIcon={<OpportunityIcon />}
            childEntityReadAccess
            childEntityValueGetter={journeyCardValueGetter}
            childEntityTagsGetter={journeyCardTagsGetter}
            journeyTypeName="subspace"
            state={{ loading: state.loading, error: state.error }}
            renderChildEntityCard={subsubspace => (
              <SubspaceCard
                displayName={subsubspace.profile.displayName}
                tagline={subsubspace.profile.tagline!}
                vision={subsubspace.context?.vision!}
                innovationFlowState={subsubspace.collaboration?.innovationFlow?.currentState.displayName}
                tags={subsubspace.profile.tagset?.tags!}
                banner={subsubspace.profile.cardBanner}
                journeyUri={subsubspace.profile.url}
                spaceVisibility={spaceVisibility}
                member={subsubspace.community?.myMembershipStatus === CommunityMembershipStatus.Member}
              />
            )}
            onClickCreate={() => setCreateDialogOpen(true)}
            childEntityCreateAccess={permissions.canCreateSubspace}
            childEntityOnCreate={() => setCreateDialogOpen(true)}
            createSubentityDialog={
              <JourneyCreationDialog
                open={isCreateDialogOpen}
                icon={<OpportunityIcon />}
                journeyName={t('common.subsubspace')}
                onClose={() => setCreateDialogOpen(false)}
                onCreate={handleCreate}
                formComponent={CreateOpportunityForm}
              />
            }
            children={
              <CalloutsGroupView
                journeyId={journeyId}
                callouts={callouts.groupedCallouts[CalloutGroupName.Subspaces]}
                canCreateCallout={callouts.canCreateCallout}
                canCreateCalloutFromTemplate={callouts.canCreateCalloutFromTemplate}
                loading={callouts.loading}
                journeyTypeName="subspace"
                calloutNames={callouts.calloutNames}
                onSortOrderUpdate={callouts.onCalloutsSortOrderUpdate}
                onCalloutUpdate={callouts.refetchCallout}
                groupName={CalloutGroupName.Subspaces}
              />
            }
          />
        )}
      </ChallengeOpportunitiesContainer>
    </SubspacePageLayout>
  );
};

export default ChallengeOpportunitiesPage;
