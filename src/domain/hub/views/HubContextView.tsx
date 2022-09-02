import { ApolloError } from '@apollo/client';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityItem } from '../../../common/components/composite/common/ActivityPanel/Activities';
import ApplicationButton from '../../../common/components/composite/common/ApplicationButton/ApplicationButton';
import ContextSection from '../../../common/components/composite/sections/ContextSection';
import ApplicationButtonContainer from '../../../containers/application/ApplicationButtonContainer';
import { ContextTabFragment, Tagset, ActivityItemFragment, Context } from '../../../models/graphql-schema';
import { ViewProps } from '../../../models/view';
import { ActivityType } from '../../activity/ActivityType';
import getActivityCount from '../../activity/utils/getActivityCount';
import ActivityView from '../../activity/views/ActivityView';
import HubCommunityView from '../../community/entities/HubCommunityView';
import DashboardGenericSection from '../../shared/components/DashboardSections/DashboardGenericSection';

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
  activity: ActivityItemFragment[] | undefined;
}

export const HubContextView: FC<HubContextViewProps> = ({ activity, entities, state }) => {
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

  const { t, i18n } = useTranslation();

  const activityItems: ActivityItem[] = useMemo(() => {
    return [
      {
        name: t('common.challenges'),
        type: ActivityType.Challenge,
        count: getActivityCount(activity, 'challenges'),
        color: 'neutral',
      },
      {
        name: t('common.opportunities'),
        count: getActivityCount(activity, 'opportunities'),
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
          <ActivityView activity={activityItems} loading={loading} />
        </DashboardGenericSection>
      }
      rightColumn={<HubCommunityView />}
    />
  );
};
export default HubContextView;
