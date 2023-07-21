import React, { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  journeyCardTagsGetter,
  journeyCardValueGetter,
} from '../../../../common/components/core/card-filter/value-getters/journeyCardValueGetter';
import { buildChallengeUrl } from '../../../../common/utils/urlBuilders';
import { getVisualByType } from '../../../common/visual/utils/visuals.utils';
import { JourneyCreationDialog } from '../../../shared/components/JorneyCreationDialog';
import { JourneyFormValues } from '../../../shared/components/JorneyCreationDialog/JourneyCreationForm';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { useJourneyCreation } from '../../../shared/utils/useJourneyCreation/useJourneyCreation';
import ChallengeCard from '../../challenge/ChallengeCard/ChallengeCard';
import { CreateChallengeForm } from '../../challenge/forms/CreateChallengeForm';
import { ChallengeIcon } from '../../challenge/icon/ChallengeIcon';
import ChildJourneyView from '../../common/tabs/Subentities/ChildJourneyView';
import ChallengesCardContainer from '../containers/ChallengesCardContainer';
import { useSpace } from '../SpaceContext/useSpace';
import SpacePageLayout from '../layout/SpacePageLayout';
import useCallouts from '../../../collaboration/callout/useCallouts/useCallouts';
import CalloutsGroupView from '../../../collaboration/callout/CalloutsInContext/CalloutsGroupView';
import { VisualName } from '../../../common/visual/constants/visuals.constants';
import { CalloutDisplayLocation } from '../../../../core/apollo/generated/graphql-schema';

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

  const {
    groupedCallouts,
    canCreateCallout,
    calloutNames,
    loading,
    calloutsSortOrder,
    onCalloutsSortOrderUpdate,
    refetchCallout,
  } = useCallouts({
    spaceNameId,
    calloutGroups: [CalloutDisplayLocation.SpaceChallengesLeft, CalloutDisplayLocation.SpaceChallengesRight],
  });

  return (
    <SpacePageLayout currentSection={EntityPageSection.Challenges}>
      <ChallengesCardContainer spaceNameId={spaceNameId}>
        {(entities, state) => (
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
                banner={getVisualByType(VisualName.BANNERNARROW, challenge.profile.visuals)}
                tags={challenge.profile.tagset?.tags!}
                tagline={challenge.profile.tagline!}
                vision={challenge.context?.vision!}
                innovationFlowState={challenge.innovationFlow?.lifecycle?.state}
                journeyUri={buildChallengeUrl(spaceNameId, challenge.nameID)}
                locked={!challenge.authorization?.anonymousReadAccess}
                spaceVisibility={visibility}
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
                callouts={groupedCallouts[CalloutDisplayLocation.SpaceChallengesLeft]}
                spaceId={spaceNameId}
                canCreateCallout={canCreateCallout}
                loading={loading}
                journeyTypeName="space"
                sortOrder={calloutsSortOrder}
                calloutNames={calloutNames}
                onSortOrderUpdate={onCalloutsSortOrderUpdate}
                onCalloutUpdate={refetchCallout}
                group={CalloutDisplayLocation.SpaceChallengesLeft}
              />
            }
            childrenRight={
              <CalloutsGroupView
                callouts={groupedCallouts[CalloutDisplayLocation.SpaceChallengesRight]}
                spaceId={spaceNameId}
                canCreateCallout={canCreateCallout}
                loading={loading}
                journeyTypeName="space"
                sortOrder={calloutsSortOrder}
                calloutNames={calloutNames}
                onSortOrderUpdate={onCalloutsSortOrderUpdate}
                onCalloutUpdate={refetchCallout}
                group={CalloutDisplayLocation.SpaceChallengesRight}
              />
            }
          />
        )}
      </ChallengesCardContainer>
    </SpacePageLayout>
  );
};

export default SpaceChallengesPage;
