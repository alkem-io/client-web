import Grid from '@mui/material/Grid';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityItem } from '../../components/composite/common/ActivityPanel/Activities';
import ApplicationButton from '../../components/composite/common/ApplicationButton/ApplicationButton';
import EntityContributionCard from '../../components/composite/common/cards/ContributionCard/EntityContributionCard';
import DashboardCommunitySectionV2 from '../../components/composite/common/sections/DashboardCommunitySectionV2';
import DashboardDiscussionsSection from '../../components/composite/common/sections/DashboardDiscussionsSection';
import DashboardGenericSection from '../../components/composite/common/sections/DashboardGenericSection';
import DashboardUpdatesSection from '../../components/composite/common/sections/DashboardUpdatesSection';
import { Loading } from '../../components/core';
import Markdown from '../../components/core/Markdown';
import { SectionSpacer } from '../../components/core/Section/Section';
import ApplicationButtonContainer from '../../containers/application/ApplicationButtonContainer';
import { ChallengeContainerEntities, ChallengeContainerState } from '../../containers/challenge/ChallengePageContainer';
import { useChallenge, useEcoverse } from '../../hooks';
import { User } from '../../models/graphql-schema';
import getActivityCount from '../../utils/get-activity-count';
import { buildOpportunityUrl } from '../../utils/urlBuilders';
import ActivityView from '../Activity/ActivityView';
import AssociatedOrganizationsView from '../ProfileView/AssociatedOrganizationsView';

const CHALLENGES_NUMBER_IN_SECTION = 2;
const SPACING = 2;

interface ChallengeDashboardViewProps {
  entities: ChallengeContainerEntities;
  state: ChallengeContainerState;
}

export const ChallengeDashboardView: FC<ChallengeDashboardViewProps> = ({ entities, state }) => {
  const { t } = useTranslation();

  const { ecoverse, loading: loadingEcoverseContext } = useEcoverse();
  const { ecoverseNameId, ecoverseId, challengeId, challengeNameId, loading: loadingChallengeContext } = useChallenge();

  const { challenge, activity, isMember, discussions, permissions } = entities;

  const { loading } = state;

  const { displayName, context, leadOrganizations = [] } = challenge || {};
  const communityId = challenge?.community?.id || '';
  const members = (challenge?.community?.members || []) as User[];

  const { tagline = '', visual, vision = '' } = context || {};
  const bannerUrl = visual?.banner;

  const orgNameIds = leadOrganizations.map(x => x.nameID);

  const opportunities = challenge?.opportunities;
  const { communityReadAccess } = permissions;

  if (loading || loadingEcoverseContext || loadingChallengeContext) return <Loading />;

  return (
    <>
      <Grid container spacing={SPACING}>
        <Grid item xs={12} md={6}>
          <DashboardGenericSection
            bannerUrl={bannerUrl}
            headerText={displayName}
            primaryAction={
              <ApplicationButtonContainer
                entities={{
                  ecoverseId,
                  ecoverseNameId,
                  ecoverseName: ecoverse?.displayName || '',
                  challengeId,
                  challengeName: challenge?.displayName || '',
                  challengeNameId,
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
          <DashboardGenericSection headerText={t('pages.challenge.sections.dashboard.statistics.title')}>
            <ActivityView activity={activity} loading={loading} />
          </DashboardGenericSection>
          {communityReadAccess && (
            <>
              <SectionSpacer />
              <DashboardUpdatesSection entities={{ ecoverseId: ecoverseNameId, communityId }} />
              <SectionSpacer />
              <DashboardDiscussionsSection discussions={discussions} isMember={isMember} />
            </>
          )}
        </Grid>
        <Grid item md={6} xs={12} spacing={SPACING}>
          <AssociatedOrganizationsView
            title={t('pages.challenge.sections.dashboard.organization')}
            organizationNameIDs={orgNameIds}
          />
          <SectionSpacer />
          <DashboardGenericSection
            headerText={t('pages.challenge.sections.dashboard.opportunities.title')}
            helpText={t('pages.challenge.sections.dashboard.opportunities.help-text')}
            navText={t('buttons.see-all')}
            navLink={'opportunities'}
          >
            <Grid container item spacing={SPACING}>
              {opportunities?.slice(0, CHALLENGES_NUMBER_IN_SECTION).map((x, i) => {
                const _activity = x.activity ?? [];
                const activities: ActivityItem[] = [
                  {
                    name: t('pages.activity.projects'),
                    digit: getActivityCount(_activity, 'projects') || 0,
                    color: 'primary',
                  },
                  {
                    name: t('pages.activity.members'),
                    digit: getActivityCount(_activity, 'members') || 0,
                    color: 'positive',
                  },
                ];
                return (
                  <Grid key={i} item flexGrow={0} flexBasis={'50%'}>
                    <EntityContributionCard
                      activities={activities}
                      loading={loading}
                      details={{
                        headerText: x.displayName,
                        tags: x.tagset?.tags ?? [],
                        mediaUrl: x.context?.visual?.background ?? '',
                        url: buildOpportunityUrl(ecoverseNameId, challengeNameId, x.nameID),
                      }}
                    />
                  </Grid>
                );
              })}
            </Grid>
          </DashboardGenericSection>
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
