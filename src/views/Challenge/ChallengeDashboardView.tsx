import React, { FC } from 'react';
import { ChallengeContainerEntities, ChallengeContainerState } from '../../containers/challenge/ChallengePageContainer';
import Section, { Body, Header as SectionHeader, SubHeader } from '../../components/core/Section';
import ActivityCard from '../../components/composite/common/ActivityPanel/ActivityCard';
import hexToRGBA from '../../utils/hexToRGBA';
import Grid from '@mui/material/Grid';
import Button from '../../components/core/Button';
import Divider from '../../components/core/Divider';
import { DiscussionsProvider } from '../../context/Discussions/DiscussionsProvider';
import ChallengeCommunitySection from '../../components/composite/entities/Challenge/ChallengeCommunitySection';
import BackdropWithMessage from '../../components/composite/common/Backdrops/BackdropWithMessage';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@mui/styles';
import { useChallenge, useEcoverse } from '../../hooks';
import { Loading } from '../../components/core';
import Icon from '../../components/core/Icon';
import { ReactComponent as JournalBookmarkIcon } from 'bootstrap-icons/icons/journal-text.svg';
import { OrganizationBanners } from '../../components/composite/entities/Organization/OrganizationBanners';
import Markdown from '../../components/core/Markdown';
import ApplicationButtonContainer from '../../containers/application/ApplicationButtonContainer';
import ApplicationButton from '../../components/composite/common/ApplicationButton/ApplicationButton';

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

  const { displayName: name = '', context, leadOrganizations = [] } = challenge || {};

  const { references, tagline, who = '', visual, vision = '' } = context || {};
  const bannerImg = visual?.banner;
  const video = references?.find(x => x.name === 'video');

  const challengeRefs = (challenge?.context?.references || []).filter(r => r.uri).slice(0, 3);

  if (loading || loadingEcoverseContext || loadingChallengeContext) return <Loading />;

  return (
    <>
      <Section
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
      <Divider />
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
      </BackdropWithMessage>
    </>
  );
};
