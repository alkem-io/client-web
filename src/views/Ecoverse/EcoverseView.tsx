import { Context } from '@apollo/client';
import { Grid } from '@material-ui/core';
import { ReactComponent as CompassIcon } from 'bootstrap-icons/icons/compass.svg';
import { ReactComponent as FileEarmarkIcon } from 'bootstrap-icons/icons/file-earmark.svg';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsButton } from '../../components/composite';
import ActivityCard from '../../components/composite/common/ActivityPanel/ActivityCard';
import ApplicationButton from '../../components/composite/common/ApplicationButton/ApplicationButton';
import AuthenticationBackdrop from '../../components/composite/common/Backdrops/AuthenticationBackdrop';
import MembershipBackdrop from '../../components/composite/common/Backdrops/MembershipBackdrop';
import { Loading } from '../../components/core';
import Button from '../../components/core/Button';
import CardFilter from '../../components/core/card-filter/CardFilter';
import {
  entityTagsValueGetter,
  entityValueGetter,
} from '../../components/core/card-filter/value-getters/entity-value-getter';
import { CardContainer } from '../../components/core/CardContainer';
import Divider from '../../components/core/Divider';
import ErrorBlock from '../../components/core/ErrorBlock';
import Icon from '../../components/core/Icon';
import { Image } from '../../components/core/Image';
import Markdown from '../../components/core/Markdown';
import Section, { Body, Header as SectionHeader, SubHeader } from '../../components/core/Section';
import { SwitchCardComponent } from '../../components/composite/entities/Ecoverse/Cards';
import ChallengeCard from '../../components/composite/entities/Ecoverse/ChallengeCard';
import EcoverseCommunitySection from '../../components/composite/entities/Ecoverse/EcoverseCommunitySection';
import ApplicationButtonContainer from '../../containers/application/ApplicationButtonContainer';
import EcoverseChallengesContainer from '../../containers/ecoverse/EcoverseChallengesContainer';
import { EcoverseContainerEntities, EcoverseContainerState } from '../../containers/ecoverse/EcoversePageContainer';
import { createStyles, useUserContext } from '../../hooks';
import { buildAdminEcoverseUrl, buildChallengeUrl } from '../../utils/urlBuilders';

const useStyles = createStyles(theme => ({
  buttonsWrapper: {
    display: 'flex',
    gap: theme.spacing(1),
  },
  ecoverseBannerImg: {
    maxWidth: 320,
    height: 'initial',
    margin: '0 auto',
  },
}));

interface EcoverseViewProps {
  entities: EcoverseContainerEntities;
  state: EcoverseContainerState;
}

export const EcoverseView: FC<EcoverseViewProps> = ({ entities }) => {
  const { t } = useTranslation();
  const { user } = useUserContext();
  const styles = useStyles();
  const { ecoverse, permissions, activity, projects, isAuthenticated, hideChallenges } = entities;
  const { displayName: name = '', nameID: ecoverseNameId = '', id: ecoverseId = '', context } = ecoverse || {};
  const ecoverseBanner = ecoverse?.context?.visual?.banner;
  const { tagline = '', impact = '', vision = '', background = '', references = [] } = context || ({} as Context);
  const learnMore = references?.find(x => x.name === 'website');

  return (
    <>
      <Section
        avatar={
          ecoverseBanner ? (
            <Image src={ecoverseBanner} alt={`${name} logo`} className={styles.ecoverseBannerImg} />
          ) : (
            <div />
          )
        }
        details={
          <ActivityCard title={t('pages.activity.title', { blockName: t('pages.ecoverse.title') })} items={activity} />
        }
      >
        <SectionHeader
          text={name}
          editComponent={
            permissions.canEdit && (
              <SettingsButton
                color={'primary'}
                to={buildAdminEcoverseUrl(ecoverseNameId)}
                tooltip={t('pages.ecoverse.sections.header.buttons.settings.tooltip')}
              />
            )
          }
        />

        <SubHeader text={tagline} />
        <Body>
          <Markdown children={vision} />
          <div className={styles.buttonsWrapper}>
            {learnMore && <Button text={t('buttons.learn-more')} as={'a'} href={`${learnMore.uri}`} target="_blank" />}
            <ApplicationButtonContainer
              entities={{
                ecoverseId,
                ecoverseNameId,
                ecoverseName: ecoverse?.displayName || '',
              }}
            >
              {(e, s) => <ApplicationButton {...e?.applicationButtonProps} loading={s.loading} />}
            </ApplicationButtonContainer>
          </div>
        </Body>
      </Section>
      <Divider />
      <MembershipBackdrop show={hideChallenges} blockName={t('pages.ecoverse.sections.challenges.header')}>
        <Section avatar={<Icon component={CompassIcon} color="primary" size="xl" />}>
          <SectionHeader text={t('pages.ecoverse.sections.challenges.header')} />
          <SubHeader>
            <Markdown children={background} />
          </SubHeader>
          <Body>
            <Markdown children={impact} />
          </Body>
        </Section>
        <EcoverseChallengesContainer
          entities={{
            ecoverseNameId,
          }}
        >
          {(cEntities, cState) => {
            /* TODO: Move in separate component with its own loading logic */
            if (cState?.loading)
              return (
                <Loading
                  text={t('components.loading.message', {
                    blockName: t('pages.ecoverse.sections.challenges.header'),
                  })}
                />
              );
            if (cState?.error)
              return (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <ErrorBlock blockName={t('pages.ecoverse.sections.challenges.header')} />
                  </Grid>
                </Grid>
              );
            return (
              <CardFilter
                data={cEntities?.challenges || []}
                tagsValueGetter={entityTagsValueGetter}
                valueGetter={entityValueGetter}
              >
                {filteredData => (
                  <CardContainer>
                    {filteredData.map((challenge, i) => (
                      <ChallengeCard
                        key={i}
                        id={challenge.id}
                        displayName={challenge.displayName}
                        activity={challenge?.activity || []}
                        context={{
                          tagline: challenge?.context?.tagline || '',
                          visual: { background: challenge?.context?.visual?.background || '' },
                        }}
                        isMember={user?.ofChallenge(challenge.id) || false}
                        tags={challenge?.tagset?.tags || []}
                        url={buildChallengeUrl(ecoverseNameId, challenge.nameID)}
                      />
                    ))}
                  </CardContainer>
                )}
              </CardFilter>
            );
          }}
        </EcoverseChallengesContainer>
      </MembershipBackdrop>

      <Divider />
      <AuthenticationBackdrop blockName={t('pages.ecoverse.sections.community.header')}>
        <EcoverseCommunitySection
          title={t('pages.ecoverse.sections.community.header')}
          subTitle={t('pages.ecoverse.sections.community.subheader')}
          body={context?.who}
          shuffle={true}
        />
      </AuthenticationBackdrop>
      <Divider />
      <AuthenticationBackdrop blockName={t('pages.ecoverse.sections.projects.header')}>
        {projects.length > 0 && (
          <>
            <Section avatar={<Icon component={FileEarmarkIcon} color="primary" size="xl" />}>
              <SectionHeader text={t('pages.ecoverse.sections.projects.header')} tagText={'Work in progress'} />
              <SubHeader text={t('pages.ecoverse.sections.projects.subheader', { ecoverse: name })} />
            </Section>
            {isAuthenticated && (
              <CardContainer cardHeight={380} xs={12} md={6} lg={4} xl={3}>
                {projects.map(({ type, ...rest }, i) => {
                  const Component = SwitchCardComponent({ type });
                  return <Component {...rest} key={i} />;
                })}
              </CardContainer>
            )}
            <Divider />
          </>
        )}
      </AuthenticationBackdrop>
    </>
  );
};
export default EcoverseView;
