import React, { forwardRef } from 'react';
import { Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  AUTH_LOGIN_PATH,
  AUTH_SIGN_UP_PATH,
} from '../../../../core/auth/authentication/constants/authentication.constants';
import { RouterLink } from '../../../../common/components/core/RouterLink';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import { Caption } from '../../../../core/ui/typography';
import { gutters } from '../../../../core/ui/grid/utils';
import { Actions } from '../../../../core/ui/actions/Actions';

const AnonymousUserHome = forwardRef<HTMLDivElement>((_, ref) => {
  const { t } = useTranslation();
  const banner1Url = './alkemio-banner/alkemio-side-banner-left.png';
  const banner2Url = './alkemio-banner/alkemio-side-banner-right.png';

  return (
    <>
      <PageContentBlock halfWidth disablePadding ref={ref} sx={{ display: 'flex', flexDirection: 'row' }}>
        <Box component="img" src={banner1Url} alt="" />
        <Box display="flex" flexDirection="column" padding={gutters()} gap={gutters()}>
          <PageContentBlockHeader title={t('pages.home.sections.welcome.existing-user.header')} />
          <Caption>{t('pages.home.sections.welcome.existing-user.subheader')}</Caption>
          <Actions>
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
            <Button href={t('pages.home.sections.welcome.existing-user.more-info-url')} target="_blank">
              {t('pages.home.sections.welcome.existing-user.more-info')}
            </Button>
          </Actions>
        </Box>
      </PageContentBlock>
      <PageContentBlock halfWidth disablePadding sx={{ display: 'flex', flexDirection: 'row' }}>
        <Box component="img" src={banner2Url} alt="" sx={{ order: '1' }} />
        <Box display="flex" flexDirection="column" padding={gutters()} gap={gutters()}>
          <PageContentBlockHeader title={t('pages.home.sections.welcome.new-to-alkemio.header')} />
          <Caption>{t('pages.home.sections.welcome.new-to-alkemio.subheader')}</Caption>
          <Actions>
            <Button
              color="primary"
              variant="contained"
              aria-label="Sign up"
              component={RouterLink}
              to={AUTH_SIGN_UP_PATH}
              sx={{
                marginRight: theme => theme.spacing(1),
              }}
            >
              {t('authentication.sign-up')}
            </Button>
            <Button href={t('pages.home.sections.welcome.new-to-alkemio.more-info-url')} target="_blank">
              {t('pages.home.sections.welcome.new-to-alkemio.more-info')}
            </Button>
          </Actions>
        </Box>
      </PageContentBlock>
    </>
  );
});

export default AnonymousUserHome;
