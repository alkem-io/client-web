import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityComponent,
  ActivityComponentProps,
} from '@/domain/collaboration/activity/ActivityLog/ActivityComponent';
import { Caption } from '@/core/ui/typography';
import { useTranslation } from 'react-i18next';
import TopCalloutDetails from '@/domain/collaboration/calloutsSet/TopCallout/TopCalloutDetails';
import { Identifiable } from '@/core/utils/Identifiable';
import { gutters } from '@/core/ui/grid/utils';
import AltToggle from '@/core/ui/forms/AltToggle/AltToggle';
import Gutters from '@/core/ui/grid/Gutters';
import { Box } from '@mui/material';
import { RECENT_ACTIVITIES_LIMIT_INITIAL, RECENT_ACTIVITIES_LIMIT_EXPANDED } from '../../common/constants';
import { Actions } from '@/core/ui/actions/Actions';

export interface RecentContributionsBlockProps extends ActivityComponentProps {
  readUsersAccess: boolean;
  entityReadAccess: boolean;
  activitiesLoading: boolean;
  fetchMoreActivities: (limit: number) => void;
  topCallouts:
    | (Identifiable & {
        activity: number;
        framing: {
          profile: {
            url: string;
            displayName: string;
            description?: string;
          };
        };
      })[]
    | undefined;
}

enum Mode {
  RecentActivity,
  TopCallouts,
}

const RecentContributionsBlock = ({
  readUsersAccess,
  entityReadAccess,
  activities,
  activitiesLoading,
  fetchMoreActivities,
  topCallouts,
}: RecentContributionsBlockProps) => {
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

  const getAccessErrorTypeName = () => {
    if (!entityReadAccess && readUsersAccess) {
      return 'activity-join-error-message' as const;
    }
    if (!readUsersAccess && entityReadAccess) {
      return 'activity-sign-in-error-message' as const;
    }
    if (!entityReadAccess && !readUsersAccess) {
      return 'activity-sign-in-and-join-error-message' as const;
    }
  };

  const accessErrorTypeName = getAccessErrorTypeName();

  return (
    <Box>
      <Actions justifyContent="end">
        <AltToggle
          value={mode}
          options={modeOptions}
          onChange={setMode}
          sx={{ height: gutters(), marginBottom: gutters() }}
          aria-label={t('components.dashboardRecentContributions.modes.switchMode')}
        />
      </Actions>
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
            {accessErrorTypeName && (
              <Caption>
                {t(`components.activity-log-section.${accessErrorTypeName}` as const, {
                  spaceLevel: t('common.space'),
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
                calloutUri={callout.framing.profile.url}
              />
            ))}
          </Gutters>
        )}
      </Box>
    </Box>
  );
};

export default RecentContributionsBlock;
