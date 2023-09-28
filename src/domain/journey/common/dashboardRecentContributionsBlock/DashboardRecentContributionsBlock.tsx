import React, { useMemo, useState } from 'react';
import { CalloutType } from '../../../../core/apollo/generated/graphql-schema';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import { ActivityComponent, ActivityLogComponentProps } from '../../../shared/components/ActivityLog/ActivityComponent';
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

export interface DashboardRecentContributionsBlockProps extends PageContentBlockProps, ActivityLogComponentProps {
  readUsersAccess: boolean;
  entityReadAccess: boolean;
  activitiesLoading: boolean;
  topCallouts:
    | (Identifiable & {
        nameID: string;
        activity: number;
        type: CalloutType;
        profile: {
          displayName: string;
          description?: string;
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

  return (
    <PageContentBlock {...blockProps}>
      <PageContentBlockHeader title={t('components.dashboardRecentContributions.title')}>
        <AltToggle value={mode} options={modeOptions} onChange={setMode} sx={{ height: gutters() }} />
      </PageContentBlockHeader>

      <Box position="relative" flexGrow={1} flexBasis={gutters(12)}>
        <Box position="absolute" top={0} left={0} bottom={0} right={0} display="flex" flexDirection="column">
          {mode === Mode.RecentActivity && (
            <>
              {readUsersAccess && entityReadAccess && showActivities && (
                <>
                  <OverflowGradient
                    overflowMarker={
                      <SeeMore subject={t('common.contributions')} onClick={() => setIsActivitiesDialogOpen(true)} />
                    }
                  >
                    <ActivityComponent activities={activities} journeyLocation={journeyLocation} />
                  </OverflowGradient>
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
                    title={callout.profile.displayName}
                    description={callout.profile.description ?? ''}
                    activity={callout.activity}
                    type={callout.type}
                    calloutUri={journeyLocation && buildCalloutUrl(callout.nameID, journeyLocation)}
                  />
                ))}
              </Gutters>
            </OverflowGradient>
          )}
        </Box>
      </Box>
    </PageContentBlock>
  );
};

export default DashboardRecentContributionsBlock;
