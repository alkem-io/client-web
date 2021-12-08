import { Grid } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityItem } from '../../components/composite/common/ActivityPanel/Activities';
import ApplicationButton from '../../components/composite/common/ApplicationButton/ApplicationButton';
import ContributionCard from '../../components/composite/common/cards/ContributionCard/ContributionCard';
import DashboardCommunitySectionV2 from '../../components/composite/common/sections/DashboardCommunitySectionV2';
import DashboardDiscussionsSection from '../../components/composite/common/sections/DashboardDiscussionsSection';
import DashboardGenericSection from '../../components/composite/common/sections/DashboardGenericSection';
import DashboardUpdatesSection from '../../components/composite/common/sections/DashboardUpdatesSection';
import Markdown from '../../components/core/Markdown';
import ApplicationButtonContainer from '../../containers/application/ApplicationButtonContainer';
import { Discussion } from '../../models/discussion/discussion';
import { Challenge, User } from '../../models/graphql-schema';
import getActivityCount from '../../utils/get-activity-count';
import { buildChallengeUrl } from '../../utils/urlBuilders';
import ActivityView from '../Activity/ActivityView';
import AssociatedOrganizationsView from '../ProfileView/AssociatedOrganizationsView';

export interface EcoverseDashboardView2Props {
  title?: string;
  bannerUrl?: string;
  tagline?: string;
  vision?: string;
  ecoverseId?: string;
  ecoverseNameId?: string;
  communityId?: string;
  organizationNameId?: string;
  activity: ActivityItem[];
  discussions: Discussion[];
  organization?: any;
  challenges: Challenge[];
  members?: User[];
  community?: any;
  loading: boolean;
  isMember?: boolean;
}

const CHALLENGES_NUMBER_IN_SECTION = 2;
const SPACING = 2;

const EcoverseDashboardView2: FC<EcoverseDashboardView2Props> = ({
  bannerUrl,
  title,
  tagline = '',
  vision = '',
  challenges,
  members = [],
  ecoverseId = '',
  ecoverseNameId = '',
  communityId = '',
  organizationNameId,
  activity,
  discussions,
  loading,
  isMember = false,
}) => {
  const { t } = useTranslation();
  const orgNameIds = useMemo(() => (organizationNameId ? [organizationNameId] : []), [organizationNameId]);

  return (
    <>
      <Grid container spacing={SPACING}>
        <Grid container item xs={12} md={6} spacing={SPACING}>
          <Grid item xs={12}>
            <DashboardGenericSection
              bannerUrl={bannerUrl}
              headerText={title}
              primaryAction={
                <ApplicationButtonContainer
                  entities={{
                    ecoverseId,
                    ecoverseNameId,
                    ecoverseName: title || '',
                  }}
                >
                  {(e, s) => <ApplicationButton {...e?.applicationButtonProps} loading={s.loading} />}
                </ApplicationButtonContainer>
              }
              navText={t('buttons.see-more')}
              navLink={'context'}
            >
              <Markdown children={tagline} />
              <Markdown children={vision} />
            </DashboardGenericSection>
          </Grid>
          <Grid item xs={12}>
            <DashboardGenericSection headerText={t('pages.ecoverse.sections.dashboard.activity')}>
              <ActivityView activity={activity} loading={loading} />
            </DashboardGenericSection>
          </Grid>
          <Grid item xs={12}>
            <DashboardUpdatesSection entities={{ ecoverseId: ecoverseNameId, communityId }} />
          </Grid>
          <Grid item xs={12}>
            <DashboardDiscussionsSection discussions={discussions} isMember={isMember} />
          </Grid>
        </Grid>
        <Grid container item md={6} xs={12} spacing={SPACING}>
          <Grid item xs={12}>
            <AssociatedOrganizationsView
              title={t('pages.ecoverse.sections.dashboard.organization')}
              organizationNameIDs={orgNameIds}
            />
          </Grid>
          <Grid item xs={12}>
            <DashboardGenericSection
              headerText={t('pages.ecoverse.sections.dashboard.challenges.title')}
              helpText={t('pages.ecoverse.sections.dashboard.challenges.help-text')}
              navText={t('buttons.see-all')}
              navLink={'challenges'}
            >
              <Grid container item spacing={SPACING}>
                {challenges.slice(0, CHALLENGES_NUMBER_IN_SECTION).map((x, i) => {
                  const _activity = x.activity ?? [];
                  const activities: ActivityItem[] = [
                    {
                      name: t('pages.activity.opportunities'),
                      digit: getActivityCount(_activity, 'opportunities') || 0,
                      color: 'primary',
                    },
                    {
                      name: t('pages.activity.members'),
                      digit: getActivityCount(_activity, 'members') || 0,
                      color: 'positive',
                    },
                  ];
                  return (
                    <Grid key={i} item>
                      <ContributionCard
                        loading={loading}
                        details={{
                          name: x.displayName,
                          activity: activities,
                          tags: x.tagset?.tags ?? [],
                          image: x.context?.visual?.background ?? '',
                          url: buildChallengeUrl(ecoverseNameId, x.nameID),
                        }}
                      />
                    </Grid>
                  );
                })}
              </Grid>
            </DashboardGenericSection>
          </Grid>
          <Grid item xs={12}>
            <DashboardCommunitySectionV2 members={members} />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};
export default EcoverseDashboardView2;
