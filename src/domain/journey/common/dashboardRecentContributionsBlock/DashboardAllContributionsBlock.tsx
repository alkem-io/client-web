import React, { useEffect, useMemo, useState } from 'react';
import { CalloutType } from '../../../../core/apollo/generated/graphql-schema';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import {
  ActivityComponent,
  ActivityComponentProps,
} from '../../../collaboration/activity/ActivityLog/ActivityComponent';
import { Caption } from '../../../../core/ui/typography';
import PageContentBlock, { PageContentBlockProps } from '../../../../core/ui/content/PageContentBlock';
import { useTranslation } from 'react-i18next';
import { JourneyTypeName } from '../../JourneyTypeName';
import TopCalloutDetails from '../../../collaboration/callout/TopCallout/TopCalloutDetails';
import { Identifiable } from '../../../../core/utils/Identifiable';
import { gutters } from '../../../../core/ui/grid/utils';
import AltToggle from '../../../../core/ui/forms/AltToggle/AltToggle';
import Gutters from '../../../../core/ui/grid/Gutters';
import { Box } from '@mui/material';
import { RECENT_ACTIVITIES_LIMIT_INITIAL, RECENT_ACTIVITIES_LIMIT_EXPANDED } from '../journeyDashboard/constants';

export interface DashboardRecentContributionsBlockProps extends PageContentBlockProps, ActivityComponentProps {
  readUsersAccess: boolean;
  entityReadAccess: boolean;
  activitiesLoading: boolean;
  fetchMoreActivities: (limit: number) => void;
  topCallouts:
    | (Identifiable & {
        activity: number;
        type: CalloutType;
        framing: {
          profile: {
            url: string;
            displayName: string;
            description?: string;
          };
        };
      })[]
    | undefined;
  journeyTypeName: JourneyTypeName;
}

enum Mode {
  RecentActivity,
  TopCallouts,
}

const DashboardRecentContributionsBlock = ({
  readUsersAccess,
  entityReadAccess,
  activities,
  activitiesLoading,
  fetchMoreActivities,
  topCallouts,
  journeyTypeName,
  ...blockProps
}: DashboardRecentContributionsBlockProps) => {
  const { t } = useTranslation();

  const [mode, setMode] = useState(Mode.RecentActivity);

  const showActivities = activities || activitiesLoading;

  const modeOptions = useMemo(
    () => [
      {
        label: t('components.dashboardRecentContributions.modes.recentActivity'),
        value: Mode.RecentActivity,
      },
      {
        label: t('components.dashboardRecentContributions.modes.topCallouts'),
        value: Mode.TopCallouts,
      },
    ],
    [t]
  );

  // the current implementaion uses initial activities with limit of RECENT_ACTIVITIES_LIMIT_INITIAL
  // and one refetch to show the first RECENT_ACTIVITIES_LIMIT_EXPANDED
  // todo: reimplement with pagination
  useEffect(() => {
    if (mode === Mode.RecentActivity && showActivities && activities?.length === RECENT_ACTIVITIES_LIMIT_INITIAL) {
      fetchMoreActivities(RECENT_ACTIVITIES_LIMIT_EXPANDED);
    }
  }, [activities]);

  return (
    <PageContentBlock {...blockProps}>
      <PageContentBlockHeader title={t('components.dashboardRecentContributions.title')}>
        <AltToggle
          value={mode}
          options={modeOptions}
          onChange={setMode}
          sx={{ height: gutters() }}
          aria-label={t('components.dashboardRecentContributions.modes.switchMode')}
        />
      </PageContentBlockHeader>

      <Box position="relative" flexGrow={1} flexBasis={gutters(12)}>
        {mode === Mode.RecentActivity && (
          <>
            {readUsersAccess && entityReadAccess && showActivities && (
              <>
                <Gutters disablePadding>
                  <ActivityComponent activities={activities} />
                </Gutters>
              </>
            )}
            {!entityReadAccess && readUsersAccess && (
              <Caption>
                {t('components.activity-log-section.activity-join-error-message', {
                  journeyType: t(`common.${journeyTypeName}` as const),
                })}
              </Caption>
            )}
            {!readUsersAccess && entityReadAccess && (
              <Caption>{t('components.activity-log-section.activity-sign-in-error-message')}</Caption>
            )}
            {!entityReadAccess && !readUsersAccess && (
              <Caption>
                {t('components.activity-log-section.activity-sign-in-and-join-error-message', {
                  journeyType: t(`common.${journeyTypeName}` as const),
                })}
              </Caption>
            )}
          </>
        )}

        {mode === Mode.TopCallouts && (
          <Gutters disablePadding>
            {topCallouts?.map(callout => (
              <TopCalloutDetails
                key={callout.id}
                title={callout.framing.profile.displayName}
                description={callout.framing.profile.description ?? ''}
                activity={callout.activity}
                type={callout.type}
                calloutUri={callout.framing.profile.url}
              />
            ))}
          </Gutters>
        )}
      </Box>
    </PageContentBlock>
  );
};

export default DashboardRecentContributionsBlock;
