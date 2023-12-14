import React, { forwardRef, PropsWithChildren } from 'react';
import { Box, Button, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  _AUTH_LOGIN_PATH,
  AUTH_SIGN_UP_PATH,
} from '../../../core/auth/authentication/constants/authentication.constants';
import PageContentBlockHeader from '../../../core/ui/content/PageContentBlockHeader';
import { Caption } from '../../../core/ui/typography';
import { gutters } from '../../../core/ui/grid/utils';
import { Actions } from '../../../core/ui/actions/Actions';
import GridItem from '../../../core/ui/grid/GridItem';
import IdentityRouteLink from '../../../core/auth/components/IdentityRouteLink';

interface AnonymousUserHomeBlockProps {
  imageUri: string;
  imageAlign: 'left' | 'right';
}

const AnonymousUserHomeBlock = ({ imageUri, imageAlign, children }: PropsWithChildren<AnonymousUserHomeBlockProps>) => {
  return (
    <GridItem columns={6}>
      <Paper variant="outlined" sx={{ display: 'flex', flexDirection: imageAlign === 'left' ? 'row-reverse' : 'row' }}>
        <Box display="flex" flexDirection="column" padding={gutters()} gap={gutters()} flexGrow={1}>
          {children}
        </Box>
        <Box component="img" src={imageUri} alt="" sx={{ objectFit: 'cover' }} />
      </Paper>
    </GridItem>
  );
};

/**
 * @deprecated
 * TODO remove this component
 */
const AnonymousUserHome = forwardRef<HTMLDivElement>((_, ref) => {
  const { t } = useTranslation();
  const banner1Url = './alkemio-banner/alkemio-side-banner-left.png';
  const banner2Url = './alkemio-banner/alkemio-side-banner-right.png';

  return (
    <Box ref={ref} display="flex" flexWrap="wrap" gap={gutters()} flexGrow={1}>
      <AnonymousUserHomeBlock imageUri={banner1Url} imageAlign="left">
        <PageContentBlockHeader title={t('pages.home.sections.welcome.existing-user.header')} />
        <Caption>{t('pages.home.sections.welcome.existing-user.subheader')}</Caption>
        <Actions>
          <IdentityRouteLink
            color="primary"
            variant="contained"
            aria-label="Sign in"
            to={_AUTH_LOGIN_PATH}
            sx={{
              marginRight: theme => theme.spacing(1),
            }}
          >
            {t('authentication.sign-in')}
          </IdentityRouteLink>
          <Button href={t('pages.home.sections.welcome.existing-user.more-info-url')} target="_blank">
            {t('pages.home.sections.welcome.existing-user.more-info')}
          </Button>
        </Actions>
      </AnonymousUserHomeBlock>
      <AnonymousUserHomeBlock imageUri={banner2Url} imageAlign="right">
        <PageContentBlockHeader title={t('pages.home.sections.welcome.new-to-alkemio.header')} />
        <Caption>{t('pages.home.sections.welcome.new-to-alkemio.subheader')}</Caption>
        <Actions>
          <IdentityRouteLink
            color="primary"
            variant="contained"
            aria-label="Sign up"
            to={AUTH_SIGN_UP_PATH}
            sx={{
              marginRight: theme => theme.spacing(1),
            }}
          >
            {t('authentication.sign-up')}
          </IdentityRouteLink>
          <Button href={t('pages.home.sections.welcome.new-to-alkemio.more-info-url')} target="_blank">
            {t('pages.home.sections.welcome.new-to-alkemio.more-info')}
          </Button>
        </Actions>
      </AnonymousUserHomeBlock>
    </Box>
  );
});

export default AnonymousUserHome;
