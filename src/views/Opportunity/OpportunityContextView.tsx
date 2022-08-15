import { ApolloError } from '@apollo/client';
import { Box } from '@mui/material';
import React, { FC, useMemo } from 'react';
import LifecycleState from '../../components/composite/entities/Lifecycle/LifecycleState';
import ContextSection from '../../components/composite/sections/ContextSection';
import {
  ActivityItemFragment,
  AspectCardFragment,
  Context,
  ContextTabFragment,
  LifecycleContextTabFragment,
  ReferenceContextTabFragment,
  Tagset,
} from '../../models/graphql-schema';
import { ViewProps } from '../../models/view';
import DashboardOpportunityStatistics from '../../domain/shared/components/DashboardSections/DashboardOpportunityStatistics';
import { ActivityItem } from '../../components/composite/common/ActivityPanel/Activities';
import getActivityCount from '../../domain/activity/utils/getActivityCount';
import { useTranslation } from 'react-i18next';
import OpportunityCommunityView from '../../domain/community/entities/OpportunityCommunityView';

export interface OpportunityContextViewEntities {
  context?: ContextTabFragment;
  opportunityDisplayName?: string;
  opportunityTagset?: Tagset;
  opportunityLifecycle?: LifecycleContextTabFragment;
  aspects?: AspectCardFragment[];
  references?: ReferenceContextTabFragment[];
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
  activity: ActivityItemFragment[] | undefined;
}

const OpportunityContextView: FC<OpportunityContextViewProps> = ({ activity, entities, state }) => {
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
  const references = entities?.references;

  const { t, i18n } = useTranslation();

  const activityItems: ActivityItem[] = useMemo(() => {
    return [
      {
        name: t('common.agreements'),
        count: getActivityCount(activity, 'projects'),
        color: 'positive',
      },
      {
        name: t('common.interests'),
        count: getActivityCount(activity, 'relations'),
        color: 'primary',
      },
      {
        name: t('common.members'),
        count: getActivityCount(activity, 'members'),
        color: 'neutralMedium',
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
      references={references}
      loading={loading}
      leftColumn={
        <DashboardOpportunityStatistics
          headerText={t('pages.opportunity.sections.dashboard.statistics.title')}
          activities={activityItems}
          loading={loading}
        />
      }
      rightColumn={<OpportunityCommunityView />}
    />
  );
};
export default OpportunityContextView;
