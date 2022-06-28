import React, { forwardRef } from 'react';
import { Grid, Button } from '@mui/material';
import DashboardGenericSection from '../../domain/shared/components/DashboardSections/DashboardGenericSection';
import { useTranslation } from 'react-i18next';
import { AUTH_LOGIN_PATH, AUTH_REGISTER_PATH } from '../../models/constants';
import { RouterLink } from '../../components/core/RouterLink';

const AnonymousUserHome = forwardRef<HTMLDivElement>((_, ref) => {
  const { t } = useTranslation();
  const banner1Url = './alkemio-banner/alkemio-side-banner-left.png';
  const banner2Url = './alkemio-banner/alkemio-side-banner-right.png';

  return (
    <>
      <Grid item xs={12} lg={6} ref={ref}>
        <DashboardGenericSection
          bannerUrl={banner1Url}
          headerText={t('pages.home.sections.welcome.existing-user.header')}
          subHeaderText={t('pages.home.sections.welcome.existing-user.subheader')}
          sideBanner
        >
          <Button
            color="primary"
            variant="contained"
            aria-label="Sign in"
            component={RouterLink}
            to={AUTH_LOGIN_PATH}
            sx={{
              marginRight: theme => theme.spacing(1),
            }}
          >
            {t('authentication.sign-in')}
          </Button>
          <Button href={t('pages.home.sections.welcome.existing-user.more-info-url')}>
            {t('pages.home.sections.welcome.existing-user.more-info')}
          </Button>
        </DashboardGenericSection>
      </Grid>
      <Grid item xs={12} lg={6}>
        <DashboardGenericSection
          bannerUrl={banner2Url}
          headerText={t('pages.home.sections.welcome.new-to-alkemio.header')}
          subHeaderText={t('pages.home.sections.welcome.new-to-alkemio.subheader')}
          sideBanner
          sideBannerRight
        >
          <Button
            color="primary"
            variant="contained"
            aria-label="Sign up"
            component={RouterLink}
            to={AUTH_REGISTER_PATH}
            sx={{
              marginRight: theme => theme.spacing(1),
            }}
          >
            {t('authentication.sign-up')}
          </Button>
          <Button href={t('pages.home.sections.welcome.new-to-alkemio.more-info-url')} target="_blank">
            {t('pages.home.sections.welcome.new-to-alkemio.more-info')}
          </Button>
        </DashboardGenericSection>
      </Grid>
    </>
  );
});

export default AnonymousUserHome;
