import { Context } from '@apollo/client';
import { makeStyles } from '@mui/styles';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsButton } from '../../components/composite';
import ActivityCard from '../../components/composite/common/ActivityPanel/ActivityCard';
import ApplicationButton from '../../components/composite/common/ApplicationButton/ApplicationButton';
import AuthenticationBackdrop from '../../components/composite/common/Backdrops/AuthenticationBackdrop';
import EcoverseCommunitySection from '../../components/composite/entities/Ecoverse/EcoverseCommunitySection';
import Button from '../../components/core/Button';
import Divider from '../../components/core/Divider';
import { Image } from '../../components/core/Image';
import Markdown from '../../components/core/Markdown';
import Section, { Body, Header as SectionHeader, SubHeader } from '../../components/core/Section';
import ApplicationButtonContainer from '../../containers/application/ApplicationButtonContainer';
import { EcoverseContainerEntities, EcoverseContainerState } from '../../containers/ecoverse/EcoversePageContainer';
import { DiscussionsProvider } from '../../context/Discussions/DiscussionsProvider';
import { buildAdminEcoverseUrl } from '../../utils/urlBuilders';

const useStyles = makeStyles(theme => ({
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

interface EcoverseDashboardViewProps {
  entities: EcoverseContainerEntities;
  state: EcoverseContainerState;
}

export const EcoverseDashboardView: FC<EcoverseDashboardViewProps> = ({ entities }) => {
  const { t } = useTranslation();
  const styles = useStyles();
  const { ecoverse, permissions, activity } = entities;
  const { displayName: name = '', nameID: ecoverseNameId = '', id: ecoverseId = '', context } = ecoverse || {};
  const ecoverseBanner = ecoverse?.context?.visual?.banner;
  const { tagline = '', vision = '', references = [] } = context || ({} as Context);
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
      <AuthenticationBackdrop blockName={t('pages.ecoverse.sections.community.header')}>
        <DiscussionsProvider>
          <EcoverseCommunitySection
            title={t('pages.ecoverse.sections.community.header')}
            subTitle={t('pages.ecoverse.sections.community.subheader')}
            body={context?.who}
            shuffle={true}
          />
        </DiscussionsProvider>
      </AuthenticationBackdrop>
    </>
  );
};
export default EcoverseDashboardView;
