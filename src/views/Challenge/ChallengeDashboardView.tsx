import Grid from '@mui/material/Grid';
import { makeStyles } from '@mui/styles';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import ApplicationButton from '../../components/composite/common/ApplicationButton/ApplicationButton';
import { ContributionCard } from '../../components/composite/common/cards';
import DashboardCommunitySectionV2 from '../../components/composite/common/sections/DashboardCommunitySectionV2';
import DashboardDiscussionsSection from '../../components/composite/common/sections/DashboardDiscussionsSection';
import DashboardGenericSection from '../../components/composite/common/sections/DashboardGenericSection';
import DashboardUpdatesSection from '../../components/composite/common/sections/DashboardUpdatesSection';
import { Loading } from '../../components/core';
import Markdown from '../../components/core/Markdown';
import ApplicationButtonContainer from '../../containers/application/ApplicationButtonContainer';
import { ChallengeContainerEntities, ChallengeContainerState } from '../../containers/challenge/ChallengePageContainer';
import { useChallenge, useEcoverse } from '../../hooks';
import ActivityView from '../Activity/ActivityView';
import AssociatedOrganizationsView from '../ProfileView/AssociatedOrganizationsView';

const CHALLENGES_NUMBER_IN_SECTION = 2;
const SPACING = 2;

interface ChallengeDashboardViewProps {
  entities: ChallengeContainerEntities;
  state: ChallengeContainerState;
}

const useChallengeStyles = makeStyles(theme => ({
  buttonsWrapper: {
    display: 'flex',
    gap: theme.spacing(1),
  },
}));

export const ChallengeDashboardView: FC<ChallengeDashboardViewProps> = ({ entities, state }) => {
  const { t } = useTranslation();
  const styles = useChallengeStyles();

  const { ecoverse, loading: loadingEcoverseContext } = useEcoverse();
  const { ecoverseNameId, ecoverseId, challengeId, challengeNameId, loading: loadingChallengeContext } = useChallenge();

  const { challenge, activity, isAuthenticated } = entities;

  const { loading } = state;

  const { displayName, context, leadOrganizations = [] } = challenge || {};
  const communityId = challenge?.community?.id || '';

  const { references, tagline = '', who = '', visual, vision = '' } = context || {};
  const bannerUrl = visual?.banner;
  const video = references?.find(x => x.name === 'video');

  const challengeRefs = (challenge?.context?.references || []).filter(r => r.uri).slice(0, 3);

  if (loading || loadingEcoverseContext || loadingChallengeContext) return <Loading />;

  return (
    <>
      <Grid container spacing={SPACING}>
        <Grid container item xs={12} md={6} spacing={SPACING}>
          <Grid item xs={12}>
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
      {/* <Section
        details={
          <ActivityCard
            title={t('pages.activity.title', { blockName: t('pages.challenge.title') })}
            items={activity}
            lifecycle={challenge?.lifecycle}
            classes={{ padding: theme => theme.spacing(4) }}
          />
        }
        classes={{
          background: theme =>
            bannerImg ? `url("${bannerImg}") no-repeat center center / cover` : theme.palette.neutral.main,
          coverBackground: theme => hexToRGBA(theme.palette.neutral.main, 0.4),
        }}
        gutters={{
          root: true,
          content: true,
          details: false,
        }}
      >
        <Body>
          <SectionHeader text={name} classes={{ color: t => t.palette.common.white }} />

          <Grid container spacing={1}>
            {challengeRefs?.map((l, i) => (
              <Grid item key={i}>
                <Button as="a" inset variant="semiTransparent" text={l.name} href={l.uri} target="_blank" />
              </Grid>
            ))}
          </Grid>
        </Body>
      </Section>
      <Section
        avatar={<Icon component={JournalBookmarkIcon} color="primary" size="xl" />}
        details={<OrganizationBanners organizations={leadOrganizations} />}
      >
        <SectionHeader text="Challenge details" />
        <SubHeader text={tagline} />
        <Body>
          <Markdown children={vision} />
          <div className={styles.buttonsWrapper}>
            {video && <Button text={t('buttons.see-more')} as={'a'} href={video.uri} target="_blank" />}
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
          </div>
        </Body>
      </Section>
      <BackdropWithMessage
        message={t('components.backdrop.authentication', {
          blockName: t('pages.ecoverse.sections.community.header').toLocaleLowerCase(),
        })}
        show={!isAuthenticated}
      >
        <DiscussionsProvider>
          <ChallengeCommunitySection
            challengeId={challengeNameId}
            ecoverseId={ecoverseNameId}
            title={t('pages.challenge.sections.community.header')}
            subTitle={t('pages.challenge.sections.community.subheader')}
            body={who}
          />
        </DiscussionsProvider>
      </BackdropWithMessage> */}
    </>
  );
};
