import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { ReactComponent as FileEarmarkIcon } from 'bootstrap-icons/icons/file-earmark.svg';
import { ReactComponent as GemIcon } from 'bootstrap-icons/icons/gem.svg';
import { ReactComponent as JournalBookmarkIcon } from 'bootstrap-icons/icons/journal-text.svg';
import React, { FC, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ChallengeCommunitySection from '../../components/composite/entities/Challenge/ChallengeCommunitySection';
import OpportunityCard from '../../components/composite/entities/Challenge/OpportunityCard';
import ActivityCard from '../../components/composite/common/ActivityPanel/ActivityCard';
import ApplicationButton from '../../components/composite/common/ApplicationButton/ApplicationButton';
import BackdropWithMessage from '../../components/composite/common/Backdrops/BackdropWithMessage';
import SettingsButton from '../../components/composite/common/SettingsButton/SettingsButton';
import { OrganizationBanners } from '../../components/composite/entities/Organization/OrganizationBanners';
import { Loading } from '../../components/core';
import Button from '../../components/core/Button';
import CardFilter from '../../components/core/card-filter/CardFilter';
import {
  entityTagsValueGetter,
  entityValueGetter,
} from '../../components/core/card-filter/value-getters/entity-value-getter';
import { CardContainer } from '../../components/core/CardContainer';
import Divider from '../../components/core/Divider';
import Icon from '../../components/core/Icon';
import Markdown from '../../components/core/Markdown';
import Section, { Body, Header as SectionHeader, SubHeader } from '../../components/core/Section';
import { SwitchCardComponent } from '../../components/composite/entities/Ecoverse/Cards';
import ApplicationButtonContainer from '../../containers/application/ApplicationButtonContainer';
import { ChallengeContainerEntities, ChallengeContainerState } from '../../containers/challenge/ChallengePageContainer';
import { createStyles, useChallenge, useEcoverse } from '../../hooks';
import { Opportunity } from '../../models/graphql-schema';
import hexToRGBA from '../../utils/hexToRGBA';
import { buildAdminChallengeUrl, buildOpportunityUrl } from '../../utils/urlBuilders';
import { DiscussionsProvider } from '../../context/Discussions/DiscussionsProvider';

interface ChallengeViewProps {
  entities: ChallengeContainerEntities;
  state: ChallengeContainerState;
}

const useChallengeStyles = createStyles(theme => ({
  buttonsWrapper: {
    display: 'flex',
    gap: theme.spacing(1),
  },
}));

const ChallengeView: FC<ChallengeViewProps> = ({ entities, state }): React.ReactElement => {
  const { t } = useTranslation();
  const styles = useChallengeStyles();

  const { ecoverse, loading: loadingEcoverseContext } = useEcoverse();
  const { ecoverseNameId, ecoverseId, challengeId, challengeNameId, loading: loadingChallengeContext } = useChallenge();

  const { challenge, permissions, activity, isAuthenticated, projects } = entities;

  const { loading } = state;

  const opportunityRef = useRef<HTMLDivElement>(null);

  const { displayName: name = '', context, opportunities = [], leadOrganizations = [] } = challenge || {};

  const { references, background = '', tagline, who = '', visual, impact = '', vision = '' } = context || {};
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
          <Box display={'flex'} alignItems={'center'} flexGrow={1}>
            <SectionHeader
              text={name}
              className="flex-grow-1"
              classes={{ color: theme => theme.palette.neutralLight.main }}
              editComponent={
                permissions.canEdit && (
                  <SettingsButton
                    to={buildAdminChallengeUrl(ecoverseNameId, challengeNameId)}
                    tooltip={t('pages.challenge.sections.header.buttons.settings.tooltip')}
                  />
                )
              }
            />
          </Box>

          <Grid container spacing={1}>
            <Grid item>
              <Button
                inset
                variant="semiTransparent"
                text={t('common.opportunities')}
                onClick={() => opportunityRef.current?.scrollIntoView({ behavior: 'smooth' })}
              />
            </Grid>
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
      <div ref={opportunityRef} />
      <Section avatar={<Icon component={GemIcon} color="primary" size="xl" />}>
        <SectionHeader text={t('pages.challenge.sections.opportunities.header')} />
        <SubHeader text={t('pages.challenge.sections.opportunities.subheader')}>
          <Markdown children={background} />
        </SubHeader>
        <Body>
          <Markdown children={impact} />
        </Body>
        {!opportunities ||
          (opportunities.length === 0 && <Body text={t('pages.challenge.sections.opportunities.body-missing')}></Body>)}
      </Section>
      <CardFilter
        data={opportunities as Opportunity[]}
        tagsValueGetter={entityTagsValueGetter}
        valueGetter={entityValueGetter}
      >
        {filteredData => (
          <CardContainer>
            {filteredData.map((opp, i) => (
              <OpportunityCard
                key={i}
                displayName={opp.displayName}
                activity={opp.activity || []}
                url={buildOpportunityUrl(ecoverseNameId, challengeNameId, opp.nameID)}
                lifecycle={{ state: opp?.lifecycle?.state || '' }}
                context={{
                  tagline: opp?.context?.tagline || '',
                  visual: { background: opp?.context?.visual?.background || '' },
                }}
                tags={opp?.tagset?.tags || []}
              />
            ))}
          </CardContainer>
        )}
      </CardFilter>
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
      <Divider />
      <BackdropWithMessage
        message={t('components.backdrop.authentication', { blockName: t('pages.ecoverse.sections.projects.header') })}
        show={!isAuthenticated}
      >
        <Section avatar={<Icon component={FileEarmarkIcon} color="primary" size="xl" />}>
          <SectionHeader
            text={t('pages.challenge.sections.projects.header.text')}
            tagText={t('pages.challenge.sections.projects.header.tag')}
          />
          <SubHeader text={t('pages.challenge.sections.projects.subheader')} />
          <Body text={t('pages.challenge.sections.projects.body')} />
        </Section>
        {isAuthenticated && (
          <CardContainer cardHeight={380} xs={12} md={6} lg={4} xl={3}>
            {projects.map(({ type, ...rest }, i) => {
              const Component = SwitchCardComponent({ type });
              return <Component {...rest} key={i} />;
            })}
          </CardContainer>
        )}
      </BackdropWithMessage>
      <Divider />
    </>
  );
};

export { ChallengeView };
