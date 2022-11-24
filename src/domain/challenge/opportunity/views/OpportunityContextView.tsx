import { ApolloError } from '@apollo/client';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MetricItem } from '../../../../common/components/composite/common/MetricsPanel/Metrics';
import LifecycleState from '../../../platform/admin/templates/InnovationTemplates/LifecycleState';
import { OpportunityContextSection } from './OpportunityContextSection';
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
import { MetricType } from '../../../platform/metrics/MetricType';
import DashboardSectionHeaderActions from '../../../shared/components/DashboardSectionHeaderActions';

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

  const { t } = useTranslation();

  const metricsItems: MetricItem[] = useMemo(() => {
    return [
      {
        name: t('common.members'),
        count: getMetricCount(activity, MetricType.Member),
        color: 'neutralMedium',
      },
      {
        name: t('common.interests'),
        count: getMetricCount(activity, MetricType.Relation),
        color: 'primary',
      },
    ];
  }, [activity, t]);

  return (
    <OpportunityContextSection
      primaryAction={
        <DashboardSectionHeaderActions>
          <LifecycleState lifecycle={opportunityLifecycle} />
        </DashboardSectionHeaderActions>
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
