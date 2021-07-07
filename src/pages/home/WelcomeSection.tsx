import { Box } from '@material-ui/core';
import clsx from 'clsx';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ActivityCard, { ActivityCardItem } from '../../components/ActivityPanel';
import Button from '../../components/core/Button';
import Image from '../../components/core/Image';
import Loading from '../../components/core/Loading';
import Section, { Body, Header as SectionHeader, SubHeader } from '../../components/core/Section';
import { Theme } from '../../context/ThemeProvider';
import { useGlobalActivityQuery } from '../../generated/graphql';
import { useAuthenticationContext } from '../../hooks/useAuthenticationContext';
import { createStyles } from '../../hooks/useTheme';
import { AUTH_LOGIN_PATH, AUTH_REGISTER_PATH } from '../../models/Constants';
import getActivityCount from '../../utils/get-activity-count';

const useStyles = createStyles(theme => ({
  flexAlignCenter: {
    display: 'flex',
    alignItems: 'center',
  },
  flexGap: {
    display: 'flex',
    gap: theme.shape.spacing(2),
  },
  flexCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  link: {
    marginTop: `${theme.shape.spacing(2)}px`,
    marginRight: `${theme.shape.spacing(4)}px`,
    '&:hover': {
      color: theme.palette.background,
    },
  },
  banner: {
    '& > .section-cover': {
      outline: `${theme.shape.spacing(0.5)}px solid ${theme.palette.neutralMedium}`,
      outlineOffset: -theme.shape.spacing(2),
    },
  },
}));

const WelcomeSection = () => {
  const styles = useStyles();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthenticationContext();
  const { data: activity, loading: isActivityLoading } = useGlobalActivityQuery({ fetchPolicy: 'no-cache' });
  const globalActivity = activity?.metadata?.activity || [];
  const [ecoverseCount, challengeCount, userCount, orgCount] = [
    getActivityCount(globalActivity, 'ecoverses') || 0,
    getActivityCount(globalActivity, 'challenges') || 0,
    getActivityCount(globalActivity, 'users') || 0,
    getActivityCount(globalActivity, 'organisations') || 0,
  ];
  const summary: ActivityCardItem[] = useMemo(
    () => [
      { name: t('pages.activity.ecoverses'), digit: ecoverseCount, color: 'neutral' },
      {
        name: t('pages.activity.challenges'),
        digit: challengeCount,
        color: 'primary',
      },
      {
        name: t('pages.activity.users'),
        digit: userCount,
        color: 'positive',
      },
      {
        name: t('pages.activity.organisations'),
        digit: orgCount,
        color: 'positive',
      },
    ],
    [globalActivity]
  );

  const banner = './alkemio-banner.png';

  return (
    <>
      <Section
        avatar={
          <Image
            src={'./logo192.png'}
            alt={'alkemio logo'}
            style={{ maxWidth: 320, height: 'initial', margin: '0 auto' }}
          />
        }
        hideAvatar
        details={
          isActivityLoading ? (
            <Loading text={'Loading statistics ...'} />
          ) : (
            <ActivityCard title={t('pages.activity.title', { blockName: 'all' })} items={summary} />
          )
        }
      >
        <SectionHeader text={t('pages.home.sections.welcome.header')} />
        <SubHeader text={t('pages.home.sections.welcome.subheader')} />
        <Body text={t('pages.home.sections.welcome.body')}>
          <div className={clsx(styles.flexCol, styles.flexGap)}>
            {!isAuthenticated && (
              <div className={clsx(styles.flexGap, styles.flexAlignCenter)}>
                <Button text={t('authentication.sign-in')} as={'a'} href={AUTH_LOGIN_PATH} target="_blank" />
                OR
                <Button text={t('authentication.sign-up')} as={'a'} href={AUTH_REGISTER_PATH} target="_blank" />
              </div>
            )}
          </div>
        </Body>
      </Section>
      <Box p={2} />
      <Section
        details={<div></div>}
        className={styles.banner}
        classes={{
          background: (_: Theme) => `url("${banner}") no-repeat center center / cover`,
          coverBackground: (_: Theme) =>
            'linear-gradient(90deg, rgba(0,0,0,0.5326505602240896) 11%, rgba(0,226,255,0.10127801120448177) 91%)',
        }}
        gutters={{
          root: true,
          content: true,
          details: false,
        }}
      >
        <Body className="d-flex flex-column flex-grow-1">
          <SectionHeader
            text={'Want to collaborate and host challenges with Alkemio?'}
            classes={{ color: (theme: Theme) => theme.palette.neutralLight }}
          />
          <div>
            <Button
              inset
              variant="semiTransparent"
              text="contact us"
              onClick={() => console.log()}
              className={styles.link}
            />
          </div>
        </Body>
      </Section>
      <Box p={2} />
    </>
  );
};
export default WelcomeSection;
