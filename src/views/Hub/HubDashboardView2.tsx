import { Grid } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityItem } from '../../components/composite/common/ActivityPanel/Activities';
import ApplicationButton from '../../components/composite/common/ApplicationButton/ApplicationButton';
import DashboardCommunitySectionV2 from '../../components/composite/common/sections/DashboardCommunitySectionV2';
import DashboardDiscussionsSection from '../../components/composite/common/sections/DashboardDiscussionsSection';
import DashboardGenericSection from '../../components/composite/common/sections/DashboardGenericSection';
import DashboardUpdatesSection from '../../components/composite/common/sections/DashboardUpdatesSection';
import Markdown from '../../components/core/Markdown';
import { SectionSpacer } from '../../components/core/Section/Section';
import ApplicationButtonContainer from '../../containers/application/ApplicationButtonContainer';
import { Discussion } from '../../models/discussion/discussion';
import { ChallengeCardFragment, User } from '../../models/graphql-schema';
import ActivityView from '../Activity/ActivityView';
import AssociatedOrganizationsView from '../ProfileView/AssociatedOrganizationsView';
import ChallengeCard from '../../components/composite/common/cards/ChallengeCard/ChallengeCard';
import { CardLayoutContainer, CardLayoutItem } from '../../components/core/CardLayoutContainer/CardLayoutContainer';
import { ActivityType } from '../../models/constants';

export interface HubDashboardView2Props {
  title?: string;
  bannerUrl?: string;
  tagline?: string;
  vision?: string;
  hubId?: string;
  hubNameId?: string;
  communityId?: string;
  organizationNameId?: string;
  activity: ActivityItem[];
  discussions: Discussion[];
  organization?: any;
  challenges: ChallengeCardFragment[];
  members?: User[];
  community?: any;
  loading: boolean;
  isMember?: boolean;
  communityReadAccess?: boolean;
  challengesReadAccess?: boolean;
}

const SPACING = 2;

const HubDashboardView2: FC<HubDashboardView2Props> = ({
  bannerUrl,
  title,
  tagline = '',
  vision = '',
  challenges,
  members = [],
  hubId = '',
  hubNameId = '',
  communityId = '',
  organizationNameId,
  activity,
  discussions,
  loading,
  isMember = false,
  communityReadAccess = false,
  challengesReadAccess = true,
}) => {
  const { t } = useTranslation();
  const orgNameIds = useMemo(() => (organizationNameId ? [organizationNameId] : []), [organizationNameId]);

  const challengesCount = useMemo(() => {
    return activity.find(({ type }) => type === ActivityType.Challenge)?.count;
  }, [activity]);

  return (
    <>
      <Grid container spacing={SPACING}>
        <Grid item xs={12} md={6}>
          <DashboardGenericSection
            bannerUrl={bannerUrl}
            headerText={title}
            primaryAction={
              <ApplicationButtonContainer
                entities={{
                  hubId,
                  hubNameId,
                  hubName: title || '',
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
          <SectionSpacer />
          <DashboardGenericSection headerText={t('pages.hub.sections.dashboard.activity')}>
            <ActivityView activity={activity} loading={loading} />
          </DashboardGenericSection>
          {communityReadAccess && (
            <>
              <SectionSpacer />
              <DashboardUpdatesSection entities={{ hubId: hubNameId, communityId }} />
              <SectionSpacer />
              <DashboardDiscussionsSection discussions={discussions} isMember={isMember} />
            </>
          )}
        </Grid>
        <Grid item md={6} xs={12}>
          <AssociatedOrganizationsView
            title={t('pages.hub.sections.dashboard.organization')}
            organizationNameIDs={orgNameIds}
          />
          <SectionSpacer />
          {challengesReadAccess && (
            <DashboardGenericSection
              headerText={`${t('pages.hub.sections.dashboard.challenges.title')} (${challengesCount})`}
              helpText={t('pages.hub.sections.dashboard.challenges.help-text')}
              navText={t('buttons.see-all')}
              navLink={'challenges'}
            >
              <CardLayoutContainer>
                {challenges.map((x, i) => (
                  <CardLayoutItem key={i} flexBasis={'50%'}>
                    <ChallengeCard challenge={x} hubNameId={hubNameId} />
                  </CardLayoutItem>
                ))}
              </CardLayoutContainer>
            </DashboardGenericSection>
          )}
          {communityReadAccess && (
            <>
              <SectionSpacer />
              <DashboardCommunitySectionV2 members={members} />
            </>
          )}
        </Grid>
      </Grid>
    </>
  );
};
export default HubDashboardView2;
