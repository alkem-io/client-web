import { ApolloError } from '@apollo/client';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MetricItem } from '../../../../common/components/composite/common/MetricsPanel/Metrics';
import ApplicationButton from '../../../../common/components/composite/common/ApplicationButton/ApplicationButton';
import { HubContextSection } from './HubContextSection';
import ApplicationButtonContainer from '../../../../containers/application/ApplicationButtonContainer';
import { ContextTabFragment, Tagset, MetricsItemFragment, Context } from '../../../../models/graphql-schema';
import { ViewProps } from '../../../../models/view';
import { MetricType } from '../../../platform/metrics/MetricType';
import getMetricCount from '../../../platform/metrics/utils/getMetricCount';
import ActivityView from '../../../platform/metrics/views/MetricsView';
import HubCommunityView from '../../../community/community/entities/HubCommunityView';
import DashboardGenericSection from '../../../shared/components/DashboardSections/DashboardGenericSection';

interface HubContextEntities {
  context?: ContextTabFragment;
  hubId?: string;
  hubNameId?: string;
  hubDisplayName?: string;
  hubTagSet?: Tagset;
}
interface HubContextActions {}
interface HubContextState {
  loading: boolean;
  error?: ApolloError;
}
interface HubContextOptions {}

interface HubContextViewProps
  extends ViewProps<HubContextEntities, HubContextActions, HubContextState, HubContextOptions> {
  metrics: MetricsItemFragment[] | undefined;
}

export const HubContextView: FC<HubContextViewProps> = ({ metrics: activity, entities, state }) => {
  const { loading } = state;
  const { context, hubId, hubNameId, hubDisplayName, hubTagSet } = entities;

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
        name: t('common.challenges'),
        type: MetricType.Challenge,
        count: getMetricCount(activity, 'challenges'),
        color: 'neutral',
      },
      {
        name: t('common.opportunities'),
        count: getMetricCount(activity, 'opportunities'),
        color: 'primary',
      },
      {
        name: t('common.members'),
        count: getMetricCount(activity, 'members'),
        color: 'neutralMedium',
      },
    ];
  }, [activity, t]);

  return (
    <HubContextSection
      primaryAction={
        hubId && hubNameId && hubDisplayName ? (
          <ApplicationButtonContainer>
            {(e, s) => <ApplicationButton {...e?.applicationButtonProps} loading={s.loading} />}
          </ApplicationButtonContainer>
        ) : undefined
      }
      background={background}
      displayName={hubDisplayName}
      keywords={hubTagSet?.tags}
      impact={impact}
      tagline={tagline}
      location={location}
      vision={vision}
      who={who}
      contextId={id}
      loading={loading}
      leftColumn={
        <DashboardGenericSection headerText={t('pages.hub.sections.dashboard.activity')}>
          <ActivityView activity={metricsItems} loading={loading} />
        </DashboardGenericSection>
      }
      rightColumn={<HubCommunityView />}
    />
  );
};
export default HubContextView;
