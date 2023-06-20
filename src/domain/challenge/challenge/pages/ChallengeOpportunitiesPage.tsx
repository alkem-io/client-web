import { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  journeyCardTagsGetter,
  journeyCardValueGetter,
} from '../../../../common/components/core/card-filter/value-getters/journeyCardValueGetter';
import { buildOpportunityUrl } from '../../../../common/utils/urlBuilders';
import { getVisualByType } from '../../../common/visual/utils/visuals.utils';
import { JourneyCreationDialog } from '../../../shared/components/JorneyCreationDialog';
import { JourneyFormValues } from '../../../shared/components/JorneyCreationDialog/JourneyCreationForm';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { useJourneyCreation } from '../../../shared/utils/useJourneyCreation/useJourneyCreation';
import ChildJourneyView from '../../common/tabs/Subentities/ChildJourneyView';
import { useSpace } from '../../space/SpaceContext/useSpace';
import { CreateOpportunityForm } from '../../opportunity/forms/CreateOpportunityForm';
import { OpportunityIcon } from '../../opportunity/icon/OpportunityIcon';
import OpportunityCard from '../../opportunity/OpportunityCard/OpportunityCard';
import OpportunityCardsContainer from '../containers/OpportunityCardsContainer';
import { useChallenge } from '../hooks/useChallenge';
import ChallengePageLayout from '../layout/ChallengePageLayout';
import { VisualName } from '../../../common/visual/constants/visuals.constants';

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
      <OpportunityCardsContainer spaceNameId={spaceNameId} challengeNameId={challengeNameId}>
        {(entities, state) => (
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
                innovationFlowState={opportunity.lifecycle?.state}
                tags={opportunity.profile.tagset?.tags!}
                banner={getVisualByType(VisualName.BANNERNARROW, opportunity.profile.visuals)}
                journeyUri={buildOpportunityUrl(spaceNameId, challengeNameId, opportunity.nameID)}
                spaceVisibility={visibility}
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
          />
        )}
      </OpportunityCardsContainer>
    </ChallengePageLayout>
  );
};

export default ChallengeOpportunitiesPage;
