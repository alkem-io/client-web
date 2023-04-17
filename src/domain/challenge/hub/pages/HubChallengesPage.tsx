import React, { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  journeyCardTagsGetter,
  journeyCardValueGetter,
} from '../../../../common/components/core/card-filter/value-getters/journeyCardValueGetter';
import { buildChallengeUrl } from '../../../../common/utils/urlBuilders';
import { getVisualBannerNarrow } from '../../../common/visual/utils/visuals.utils';
import { JourneyCreationDialog } from '../../../shared/components/JorneyCreationDialog';
import { JourneyFormValues } from '../../../shared/components/JorneyCreationDialog/JourneyCreationForm';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { useJourneyCreation } from '../../../shared/utils/useJourneyCreation/useJourneyCreation';
import ChallengeCard from '../../challenge/ChallengeCard/ChallengeCard';
import { CreateChallengeForm } from '../../challenge/forms/CreateChallengeForm';
import { ChallengeIcon } from '../../challenge/icon/ChallengeIcon';
import ChildJourneyView from '../../common/tabs/Subentities/ChildJourneyView';
import ChallengesCardContainer from '../containers/ChallengesCardContainer';
import { useHub } from '../HubContext/useHub';
import HubPageLayout from '../layout/HubPageLayout';
import useCallouts from '../../../collaboration/callout/useCallouts/useCallouts';
import { CalloutsGroup } from '../../../collaboration/callout/CalloutsInContext/CalloutsGroup';
import CalloutsGroupView from '../../../collaboration/callout/CalloutsInContext/CalloutsGroupView';

export interface HubChallengesPageProps {}

const HubChallengesPage: FC<HubChallengesPageProps> = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { hubNameId, permissions, visibility } = useHub();

  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);

  const { createChallenge } = useJourneyCreation();

  const handleCreate = useCallback(
    async (value: JourneyFormValues) => {
      const result = await createChallenge({
        hubID: hubNameId,
        displayName: value.displayName,
        tagline: value.tagline,
        background: value.background ?? '',
        vision: value.vision,
        tags: value.tags,
      });

      if (!result) {
        return;
      }
      // delay the navigation so all other processes related to updating the cache,
      // before closing the all subscriptions are completed
      setTimeout(() => navigate(buildChallengeUrl(hubNameId, result.nameID)), 100);
    },
    [navigate, createChallenge, hubNameId]
  );

  const { groupedCallouts, canCreateCallout, calloutNames, loading, calloutsSortOrder, onCalloutsSortOrderUpdate } =
    useCallouts({
      hubNameId,
      calloutGroups: [CalloutsGroup.HomeLeft, CalloutsGroup.HomeRight],
    });

  return (
    <HubPageLayout currentSection={EntityPageSection.Challenges}>
      <ChallengesCardContainer hubNameId={hubNameId}>
        {(entities, state) => (
          <ChildJourneyView
            hubNameId={hubNameId}
            childEntities={entities.challenges}
            childEntitiesIcon={<ChallengeIcon />}
            childEntityReadAccess={permissions.canReadChallenges}
            childEntityValueGetter={journeyCardValueGetter}
            childEntityTagsGetter={journeyCardTagsGetter}
            getChildEntityUrl={entity => buildChallengeUrl(hubNameId, entity.nameID)}
            journeyTypeName="hub"
            state={{ loading: state.loading, error: state.error }}
            renderChildEntityCard={challenge => (
              <ChallengeCard
                bannerUri={getVisualBannerNarrow(challenge.profile.visuals)!}
                displayName={challenge.profile.displayName}
                tags={challenge.profile.tagset?.tags!}
                tagline={challenge.profile.tagline!}
                vision={challenge.context?.vision!}
                innovationFlowState={challenge.lifecycle?.state}
                journeyUri={buildChallengeUrl(hubNameId, challenge.nameID)}
                locked={!challenge.authorization?.anonymousReadAccess}
                hubVisibility={visibility}
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
                callouts={groupedCallouts[CalloutsGroup.ChallengesLeft]}
                hubId={hubNameId}
                canCreateCallout={canCreateCallout}
                loading={loading}
                entityTypeName="hub"
                sortOrder={calloutsSortOrder}
                calloutNames={calloutNames}
                onSortOrderUpdate={onCalloutsSortOrderUpdate}
              />
            }
          />
        )}
      </ChallengesCardContainer>
    </HubPageLayout>
  );
};

export default HubChallengesPage;
