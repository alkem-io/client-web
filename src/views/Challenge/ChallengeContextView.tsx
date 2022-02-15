import { ApolloError } from '@apollo/client';
import { Box } from '@mui/material';
import React, { FC } from 'react';
import ApplicationButton from '../../components/composite/common/ApplicationButton/ApplicationButton';
import LifecycleState from '../../components/composite/entities/Lifecycle/LifecycleState';
import ContextSection from '../../components/composite/sections/ContextSection';
import { SectionSpacer } from '../../components/core/Section/Section';
import ApplicationButtonContainer from '../../containers/application/ApplicationButtonContainer';
import {
  AspectCardFragment,
  Context,
  ContextTabFragment,
  LifecycleContextTabFragment,
  ReferenceContextTabFragment,
  Tagset,
} from '../../models/graphql-schema';
import { ViewProps } from '../../models/view';
import { getVisualBanner } from '../../utils/visuals.utils';

interface ChallengeContextEntities {
  context?: ContextTabFragment;
  hubId?: string;
  hubNameId?: string;
  hubDisplayName?: string;
  challengeId?: string;
  challengeNameId?: string;
  challengeDisplayName?: string;
  challengeTagset?: Tagset;
  challengeLifecycle?: LifecycleContextTabFragment;
  aspects?: AspectCardFragment[];
  references?: ReferenceContextTabFragment[];
}
interface ChallengeContextActions {}
interface ChallengeContextState {
  loading: boolean;
  error?: ApolloError;
}
interface ChallengeContextOptions {
  canReadAspects: boolean;
  canCreateAspects: boolean;
}

interface ChallengeContextViewProps
  extends ViewProps<
    ChallengeContextEntities,
    ChallengeContextActions,
    ChallengeContextState,
    ChallengeContextOptions
  > {}

export const ChallengeContextView: FC<ChallengeContextViewProps> = ({ entities, state, options }) => {
  const { canReadAspects, canCreateAspects } = options;
  const { loading } = state;
  const {
    context,
    hubId = '',
    hubNameId = '',
    hubDisplayName = '',
    challengeId,
    challengeNameId,
    challengeDisplayName = '',
    challengeTagset,
    challengeLifecycle,
  } = entities;
  const {
    tagline = '',
    impact = '',
    background = '',
    vision = '',
    who = '',
    visuals = [],
    id = '',
  } = context || ({} as Context);
  const banner = getVisualBanner(visuals);
  const aspects = entities?.aspects;
  const references = entities?.references;

  return (
    <ContextSection
      primaryAction={
        <Box display="flex">
          <LifecycleState lifecycle={challengeLifecycle} />
          <SectionSpacer />
          <ApplicationButtonContainer
            entities={{
              ecoverseId: hubId,
              ecoverseNameId: hubNameId,
              ecoverseName: hubDisplayName,
              challengeId,
              challengeName: challengeDisplayName,
              challengeNameId,
            }}
          >
            {(e, s) => <ApplicationButton {...e?.applicationButtonProps} loading={s.loading} />}
          </ApplicationButtonContainer>
        </Box>
      }
      banner={banner}
      background={background}
      displayName={challengeDisplayName}
      impact={impact}
      tagline={tagline}
      vision={vision}
      who={who}
      contextId={id}
      keywords={challengeTagset?.tags}
      references={references}
      aspects={aspects}
      aspectsLoading={loading}
      canReadAspects={canReadAspects}
      canCreateAspects={canCreateAspects}
    />
  );
};
