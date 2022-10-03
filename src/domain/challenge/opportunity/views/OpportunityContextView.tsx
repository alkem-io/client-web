import { ApolloError } from '@apollo/client';
import { Box } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MetricItem } from '../../../../common/components/composite/common/MetricsPanel/Metrics';
import LifecycleState from '../../../platform/admin/templates/InnovationTemplates/LifecycleState';
import ContextSection from '../../../../common/components/composite/sections/ContextSection';
import {
  ContextTabFragment,
  Tagset,
  LifecycleContextTabFragment,
  AspectCardFragment,
  MetricsItemFragment,
  Context,
} from '../../../../models/graphql-schema';
import { ViewProps } from '../../../../models/view';
import getMetricCount from '../../../platform/metrics/utils/getMetricCount';
import OpportunityCommunityView from '../../../community/community/entities/OpportunityCommunityView';
import DashboardOpportunityStatistics from '../../../shared/components/DashboardSections/DashboardOpportunityStatistics';

export interface OpportunityContextViewEntities {
  context?: ContextTabFragment;
  opportunityDisplayName?: string;
  opportunityTagset?: Tagset;
  opportunityLifecycle?: LifecycleContextTabFragment;
  aspects?: AspectCardFragment[];
}

export interface OpportunityContextViewActions {}

export interface OpportunityContextViewState {
  loading: boolean;
  error?: ApolloError;
}

export interface OpportunityContextViewOptions {}

export interface OpportunityContextViewProps
  extends ViewProps<
    OpportunityContextViewEntities,
    OpportunityContextViewActions,
    OpportunityContextViewState,
    OpportunityContextViewOptions
  > {
  metrics: MetricsItemFragment[] | undefined;
}

const OpportunityContextView: FC<OpportunityContextViewProps> = ({ metrics: activity, entities, state }) => {
  const { loading } = state;
  const { context, opportunityDisplayName, opportunityTagset, opportunityLifecycle } = entities;

  const {
    tagline = '',
    impact = '',
    background = '',
    location = undefined,
    vision = '',
    who = '',
    id = '',
  } = context || ({} as Context);

  const { t, i18n } = useTranslation();

  const metricsItems: MetricItem[] = useMemo(() => {
    return [
      {
        name: t('common.members'),
        count: getMetricCount(activity, 'members'),
        color: 'neutralMedium',
      },
      {
        name: t('common.interests'),
        count: getMetricCount(activity, 'relations'),
        color: 'primary',
      },
    ];
  }, [activity, i18n.language]);

  return (
    <ContextSection
      primaryAction={
        <Box display="flex">
          <LifecycleState lifecycle={opportunityLifecycle} />
        </Box>
      }
      background={background}
      displayName={opportunityDisplayName}
      impact={impact}
      tagline={tagline}
      location={location}
      vision={vision}
      who={who}
      contextId={id}
      keywords={opportunityTagset?.tags}
      loading={loading}
      leftColumn={
        <DashboardOpportunityStatistics
          headerText={t('pages.opportunity.sections.dashboard.statistics.title')}
          activities={metricsItems}
          loading={loading}
        />
      }
      rightColumn={<OpportunityCommunityView />}
    />
  );
};
export default OpportunityContextView;
