import { Box, Typography } from '@material-ui/core';
import clsx from 'clsx';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Grid from '@material-ui/core/Grid';
import ActivityCard, { ActivityCardItem } from '../../components/ActivityPanel';
import Button from '../../components/core/Button';
import Image from '../../components/core/Image';
import Loading from '../../components/core/Loading/Loading';
import Section, { Body, Header as SectionHeader, SubHeader } from '../../components/core/Section';
import { useAuthenticationContext, useConfig } from '../../hooks';
import { useGlobalActivityQuery } from '../../hooks/generated/graphql';
import { createStyles } from '../../hooks/useTheme';
import { AUTH_LOGIN_PATH, AUTH_REGISTER_PATH } from '../../models/constants';
import getActivityCount from '../../utils/get-activity-count';
import hexToRGBA from '../../utils/hexToRGBA';

const useStyles = createStyles(theme => ({
  flexAlignCenter: {
    display: 'flex',
    alignItems: 'center',
  },
  flexGap: {
    display: 'flex',
    gap: theme.spacing(2),
  },
  flexCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  link: {
    marginTop: `${theme.spacing(2)}px`,
    marginRight: `${theme.spacing(4)}px`,
    '&:hover': {
      color: theme.palette.background.paper,
    },
  },
  banner: {
    padding: `${theme.spacing(2)}px 0`,
  },
  bannerText: {
    color: theme.palette.background.paper,
  },
  bannerBtn: {
    margin: 0,
  },
}));

const WelcomeSection = () => {
  const styles = useStyles();
  const { platform } = useConfig();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthenticationContext();
  const { data: activity, loading: isActivityLoading } = useGlobalActivityQuery({ fetchPolicy: 'no-cache' });
  const globalActivity = activity?.metadata?.activity || [];
  const [ecoverseCount, challengeCount, opportunityCount, userCount, orgCount] = [
    getActivityCount(globalActivity, 'ecoverses') || 0,
    getActivityCount(globalActivity, 'challenges') || 0,
    getActivityCount(globalActivity, 'opportunities') || 0,
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
        name: t('pages.activity.opportunities'),
        digit: opportunityCount,
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
            background: () => `url("${banner}") no-repeat center center / cover`,
            coverBackground: theme => hexToRGBA(theme.palette.neutral.main, 0.6),
          }}
          gutters={{
            root: false,
            content: false,
            details: false,
          }}
        >
          <Grid
            container
            component={Body}
            direction={'row'}
            alignItems={'center'}
            justifyContent={'space-between'}
            className={styles.banner}
          >
            <Grid item xs={9}>
              <Typography variant="h4" className={styles.bannerText}>
                Interested in learning more about using Alkemio?
              </Typography>
            </Grid>
            <Grid container item justifyContent={'flex-end'} xs={3}>
              <Button
                inset
                variant="primary"
                text="contact us"
                href={platform?.feedback || ''}
                as={'a'}
                target="_blank"
              />
            </Grid>
          </Grid>
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
