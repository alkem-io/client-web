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
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';

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
  canCreateCommunityContextReview: boolean;
}

interface ChallengeContextViewProps
  extends ViewProps<
    ChallengeContextEntities,
    ChallengeContextActions,
    ChallengeContextState,
    ChallengeContextOptions
  > {}

export const ChallengeContextView: FC<ChallengeContextViewProps> = ({ entities, state, options }) => {
  const { t } = useTranslation();
  const { canReadAspects, canCreateAspects, canCreateCommunityContextReview } = options;
  const { loading } = state;
  const { context, challengeDisplayName = '', challengeTagset, challengeLifecycle } = entities;
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
  const references = entities?.references;

  return (
    <ContextSection
      primaryAction={
        <Box display="flex">
          <LifecycleState lifecycle={challengeLifecycle} />
          <SectionSpacer />
          {canCreateCommunityContextReview ? (
            <Button variant="contained">{t('components.context-section.give-feedback')}</Button>
          ) : (
            <ApplicationButtonContainer>
              {(e, s) => <ApplicationButton {...e?.applicationButtonProps} loading={s.loading} />}
            </ApplicationButtonContainer>
          )}
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
      aspectsLoading={loading}
      canReadAspects={canReadAspects}
      canCreateAspects={canCreateAspects}
    />
  );
};
