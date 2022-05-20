import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ApolloError } from '@apollo/client';
import { Box } from '@mui/material';
import Button from '@mui/material/Button';
import ApplicationButton from '../../components/composite/common/ApplicationButton/ApplicationButton';
import LifecycleState from '../../components/composite/entities/Lifecycle/LifecycleState';
import ContextSection from '../../components/composite/sections/ContextSection';
import { SectionSpacer } from '../../components/core/Section/Section';
import ApplicationButtonContainer from '../../containers/application/ApplicationButtonContainer';
import {
  Context,
  ContextTabFragment,
  LifecycleContextTabFragment,
  ReferenceContextTabFragment,
  Tagset,
} from '../../models/graphql-schema';
import { ViewProps } from '../../models/view';
import { getVisualBanner } from '../../utils/visuals.utils';
import { RouterLink } from '../../components/core/RouterLink';

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
  references?: ReferenceContextTabFragment[];
}
interface ChallengeContextActions {}
interface ChallengeContextState {
  loading: boolean;
  error?: ApolloError;
}
interface ChallengeContextOptions {
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
  const { canCreateCommunityContextReview } = options;
  const { loading } = state;
  const { context, challengeDisplayName = '', challengeTagset, challengeLifecycle } = entities;
  const {
    tagline = '',
    impact = '',
    background = '',
    location = undefined,
    vision = '',
    who = '',
    visuals = [],
    id = '',
  } = context || ({} as Context);
  const banner = getVisualBanner(visuals);
  const references = entities?.references;
  return (
    <>
      <ContextSection
        primaryAction={
          <Box display="flex">
            <LifecycleState lifecycle={challengeLifecycle} />
            <SectionSpacer />
            {canCreateCommunityContextReview ? (
              <Button variant="contained" component={RouterLink} to={'../feedback'}>
                {t('components.context-section.give-feedback')}
              </Button>
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
        location={location}
        vision={vision}
        who={who}
        contextId={id}
        keywords={challengeTagset?.tags}
        references={references}
        loading={loading}
      />
    </>
  );
};
