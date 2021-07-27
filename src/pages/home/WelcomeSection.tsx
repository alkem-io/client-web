import { Box, Typography } from '@material-ui/core';
import clsx from 'clsx';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ActivityCard, { ActivityCardItem } from '../../components/ActivityPanel';
import Button from '../../components/core/Button';
import Image from '../../components/core/Image';
import Loading from '../../components/core/Loading';
import Section, { Body, Header as SectionHeader, SubHeader } from '../../components/core/Section';
import { Theme } from '../../context/ThemeProvider';
import { env } from '../../env';
import { useGlobalActivityQuery } from '../../generated/graphql';
import { useAuthenticationContext } from '../../hooks';
import { createStyles } from '../../hooks';
import { AUTH_LOGIN_PATH, AUTH_REGISTER_PATH } from '../../models/constants';
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
    // '& > .section-cover': {
    //   outline: `${theme.shape.spacing(0.5)}px solid ${theme.palette.neutralMedium}`,
    //   outlineOffset: -theme.shape.spacing(2),
    // },
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.shape.spacing(1),
  },
  bannerBtn: {
    margin: 0,
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
        <Body text={t('pages.home.sections.welcome.body')}></Body>
        <Section
          hideAvatar
          hideDetails
          classes={{
            background: (_: Theme) => `url("${banner}") no-repeat center center / cover`,
            coverBackground: (_: Theme) =>
              'linear-gradient(90deg, rgba(0,0,0,0.5326505602240896) 11%, rgba(0,226,255,0.10127801120448177) 91%)',
          }}
          gutters={{
            root: false,
            content: false,
            details: false,
          }}
        >
          <Body className={clsx('d-flex flex-row flex-grow-1', styles.banner)}>
            <Box color="white">
              <Typography color="inherit" variant="h5">
                Interested in learning more about using Alkemio?
              </Typography>
            </Box>
            <Button
              inset
              variant="primary"
              text="contact us"
              href={env?.REACT_APP_FEEDBACK_URL || ''}
              as={'a'}
              target="_blank"
            />
          </Body>
        </Section>
        <div className={clsx(styles.flexCol, styles.flexGap)}>
          {!isAuthenticated && (
            <>
              <Box p={0.5}></Box>
              <div className={clsx(styles.flexGap, styles.flexAlignCenter)}>
                <Button text={t('authentication.sign-in')} as={'a'} href={AUTH_LOGIN_PATH} />
                OR
                <Button text={t('authentication.sign-up')} as={'a'} href={AUTH_REGISTER_PATH} />
              </div>
            </>
          )}
        </div>
      </Section>
    </>
  );
};
export default WelcomeSection;
