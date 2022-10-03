import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ApolloError } from '@apollo/client';
import { Box } from '@mui/material';
import Button from '@mui/material/Button';
import { MetricItem } from '../../../../common/components/composite/common/MetricsPanel/Metrics';
import ApplicationButton from '../../../../common/components/composite/common/ApplicationButton/ApplicationButton';
import LifecycleState from '../../../platform/admin/templates/InnovationTemplates/LifecycleState';
import ContextSection from '../../../../common/components/composite/sections/ContextSection';
import { RouterLink } from '../../../../common/components/core/RouterLink';
import ApplicationButtonContainer from '../../../../containers/application/ApplicationButtonContainer';
import {
  ContextTabFragment,
  Tagset,
  LifecycleContextTabFragment,
  MetricsItemFragment,
  Context,
} from '../../../../models/graphql-schema';
import { ViewProps } from '../../../../models/view';
import ActivityView from '../../../platform/metrics/views/MetricsView';
import { MetricType } from '../../../platform/metrics/MetricType';
import getMetricCount from '../../../platform/metrics/utils/getMetricCount';
import ChallengeCommunityView from '../../../community/community/entities/ChallengeCommunityView';
import DashboardGenericSection from '../../../shared/components/DashboardSections/DashboardGenericSection';
import SectionSpacer from '../../../shared/components/Section/SectionSpacer';

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
  extends ViewProps<ChallengeContextEntities, ChallengeContextActions, ChallengeContextState, ChallengeContextOptions> {
  activity: MetricsItemFragment[] | undefined;
}

export const ChallengeContextView: FC<ChallengeContextViewProps> = ({ activity, entities, state, options }) => {
  const { t, i18n } = useTranslation();
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
    id = '',
  } = context || ({} as Context);

  const metricsItems: MetricItem[] = useMemo(() => {
    return [
      {
        name: t('common.opportunities'),
        type: MetricType.Opportunity,
        count: getMetricCount(activity, 'opportunities'),
        color: 'primary',
      },
      {
        name: t('common.members'),
        count: getMetricCount(activity, 'members'),
        color: 'neutralMedium',
      },
    ];
  }, [activity, i18n.language]);

  return (
    <>
      <ContextSection
        contextType="challenge"
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
        background={background}
        displayName={challengeDisplayName}
        impact={impact}
        tagline={tagline}
        location={location}
        vision={vision}
        who={who}
        contextId={id}
        keywords={challengeTagset?.tags}
        loading={loading}
        leftColumn={
          <DashboardGenericSection headerText={t('pages.challenge.sections.dashboard.statistics.title')}>
            <ActivityView activity={metricsItems} loading={loading} />
          </DashboardGenericSection>
        }
        rightColumn={<ChallengeCommunityView />}
      />
    </>
  );
};
