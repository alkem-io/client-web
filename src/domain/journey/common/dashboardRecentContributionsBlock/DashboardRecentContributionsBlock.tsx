import React, { useEffect, useMemo, useState } from 'react';
import { CalloutType } from '../../../../core/apollo/generated/graphql-schema';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import {
  ActivityComponent,
  ActivityComponentProps,
} from '../../../collaboration/activity/ActivityLog/ActivityComponent';
import SeeMore from '../../../../core/ui/content/SeeMore';
import { Caption } from '../../../../core/ui/typography';
import PageContentBlock, { PageContentBlockProps } from '../../../../core/ui/content/PageContentBlock';
import { useTranslation } from 'react-i18next';
import { JourneyTypeName } from '../../JourneyTypeName';
import TopCalloutDetails from '../../../collaboration/callout/TopCallout/TopCalloutDetails';
import { buildCalloutUrl } from '../../../../main/routing/urlBuilders';
import { Identifiable } from '../../../../core/utils/Identifiable';
import { gutters } from '../../../../core/ui/grid/utils';
import AltToggle from '../../../../core/ui/forms/AltToggle/AltToggle';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import Gutters from '../../../../core/ui/grid/Gutters';
import OverflowGradient from '../../../../core/ui/overflow/OverflowGradient';
import { Box } from '@mui/material';

export interface DashboardRecentContributionsBlockProps extends PageContentBlockProps, ActivityComponentProps {
  readUsersAccess: boolean;
  entityReadAccess: boolean;
  activitiesLoading: boolean;
  onActivitiesDialogOpen: () => void;
  topCallouts:
    | (Identifiable & {
        nameID: string;
        activity: number;
        type: CalloutType;
        framing: {
          profile: {
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
  onActivitiesDialogOpen,
  topCallouts,
  journeyLocation,
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

  const [isActivitiesDialogOpen, setIsActivitiesDialogOpen] = useState(false);

  useEffect(() => {
    if (isActivitiesDialogOpen) {
      onActivitiesDialogOpen();
    }
  }, [isActivitiesDialogOpen]);

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
        <Gutters position="absolute" top={0} left={0} bottom={0} right={0} disablePadding>
          {mode === Mode.RecentActivity && (
            <>
              {readUsersAccess && entityReadAccess && showActivities && (
                <>
                  <OverflowGradient sx={{ margin: -1 }}>
                    <ActivityComponent activities={activities} journeyLocation={journeyLocation} />
                  </OverflowGradient>
                  <SeeMore subject={t('common.contributions')} onClick={() => setIsActivitiesDialogOpen(true)} />
                  <DialogWithGrid
                    columns={8}
                    open={isActivitiesDialogOpen}
                    onClose={() => setIsActivitiesDialogOpen(false)}
                  >
                    <DialogHeader
                      title={t('components.activity-log-section.title')}
                      onClose={() => setIsActivitiesDialogOpen(false)}
                    />
                    <Gutters>
                      <ActivityComponent activities={activities} journeyLocation={journeyLocation} />
                    </Gutters>
                  </DialogWithGrid>
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
            <OverflowGradient>
              <Gutters disablePadding>
                {topCallouts?.map(callout => (
                  <TopCalloutDetails
                    key={callout.id}
                    title={callout.framing.profile.displayName}
                    description={callout.framing.profile.description ?? ''}
                    activity={callout.activity}
                    type={callout.type}
                    calloutUri={journeyLocation && buildCalloutUrl(callout.nameID, journeyLocation)}
                  />
                ))}
              </Gutters>
            </OverflowGradient>
          )}
        </Gutters>
      </Box>
    </PageContentBlock>
  );
};

export default DashboardRecentContributionsBlock;
