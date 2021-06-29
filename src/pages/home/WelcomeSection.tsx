import clsx from 'clsx';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ActivityCard, { ActivityCardItem } from '../../components/ActivityPanel';
import Section, { Body, Header as SectionHeader, SubHeader } from '../../components/core/Section';
import Button from '../../components/core/Button';
import { AUTH_LOGIN_PATH, AUTH_REGISTER_PATH } from '../../models/Constants';
import { createStyles } from '../../hooks/useTheme';
import { useAuthenticationContext } from '../../hooks/useAuthenticationContext';
import { useGlobalActivityQuery } from '../../generated/graphql';
import Loading from '../../components/core/Loading';
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

  return (
    <>
      <Section
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
    </>
  );
};
export default WelcomeSection;
