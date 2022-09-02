import { ApolloError } from '@apollo/client';
import { Box } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityItem } from '../../../common/components/composite/common/ActivityPanel/Activities';
import LifecycleState from '../../../common/components/composite/entities/Lifecycle/LifecycleState';
import ContextSection from '../../../common/components/composite/sections/ContextSection';
import {
  ContextTabFragment,
  Tagset,
  LifecycleContextTabFragment,
  AspectCardFragment,
  ActivityItemFragment,
  Context,
} from '../../../models/graphql-schema';
import { ViewProps } from '../../../models/view';
import getActivityCount from '../../activity/utils/getActivityCount';
import OpportunityCommunityView from '../../community/entities/OpportunityCommunityView';
import DashboardOpportunityStatistics from '../../shared/components/DashboardSections/DashboardOpportunityStatistics';

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

  const { t, i18n } = useTranslation();

  const activityItems: ActivityItem[] = useMemo(() => {
    return [
      {
        name: t('common.members'),
        count: getActivityCount(activity, 'members'),
        color: 'neutralMedium',
      },
      {
        name: t('common.interests'),
        count: getActivityCount(activity, 'relations'),
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
          activities={activityItems}
          loading={loading}
        />
      }
      rightColumn={<OpportunityCommunityView />}
    />
  );
};
export default OpportunityContextView;
