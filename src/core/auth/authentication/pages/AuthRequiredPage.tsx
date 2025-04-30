import { AUTH_SIGN_UP_PATH } from '@/core/auth/authentication/constants/authentication.constants';
import { useQueryParams } from '@/core/routing/useQueryParams';
import { buildReturnUrlParam } from '@/main/routing/urlBuilders';
import { Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import TopLevelLayout from '@/main/ui/layout/TopLevelLayout';
import { gutters } from '@/core/ui/grid/utils';
import { NAVIGATION_CONTAINER_HEIGHT_GUTTERS } from '@/core/ui/navigation/NavigationBar';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { Caption, PageTitle, Tagline } from '@/core/ui/typography';
import PageContent from '@/core/ui/content/PageContent';
import { Container, LeftArea, Picture, RightArea } from '@/core/pages/Errors/Error404';

export const AuthRequiredPage = () => {
  const returnUrl = useQueryParams().get('returnUrl') ?? undefined;
  const { t } = useTranslation();

  /**
   * AuthRequiredPage can't use buildLoginUrl() directly for the following reasons:
   * - it belongs to /identity routes and is accessed from identity subdomain while the resource the user was trying
   * to access most likely was on the root domain or in an innovation hub.
   * - it isn't meant to be returned back to, the page the user intended to visit is the previous one.
   *
   * For Login/SignUp redirection to work this component receives the full returnUrl with origin already baked in.
   */
  const returnUrlParam = buildReturnUrlParam(returnUrl, '');
  const signUpUrl = `${AUTH_SIGN_UP_PATH}${returnUrlParam}`;

  return (
    <TopLevelLayout>
      <PageContent gridContainerProps={{ sx: { paddingTop: gutters(NAVIGATION_CONTAINER_HEIGHT_GUTTERS) } }}>
        <PageContentColumn columns={12}>
          <PageContentBlock>
            <Container>
              <LeftArea>
                <PageTitle component="h1" sx={theme => ({ [theme.breakpoints.down('md')]: { textAlign: 'center' } })}>
                  {t('pages.authentication-required.header')}
                </PageTitle>
                <Picture
                  src="/required.svg"
                  sx={theme => ({
                    marginTop: theme.spacing(2),
                    marginBottom: theme.spacing(2),
                    marginRight: '20px!important',
                    display: 'block',
                    [theme.breakpoints.up('md')]: { display: 'none' },
                  })}
                />
                <Tagline sx={{ marginTop: gutters(2) }}>{t('pages.authentication-required.subheader')}</Tagline>
                <Tagline sx={{ marginTop: gutters(0.5) }}>{t('pages.authentication-required.subheader2')}</Tagline>
                <Box display="flex" flexDirection="column" alignItems="center" marginTop={gutters(2)} gap={2}>
                  <Button component={Link} to={signUpUrl} variant="contained" color="primary" sx={{ minWidth: '70%' }}>
                    {`${t('authentication.sign-in')} / ${t('authentication.sign-up')}`}
                  </Button>
                  <Caption>{t('common.or')}</Caption>
                  <Button component={Link} to="/" variant="outlined" color="primary" sx={{ minWidth: '70%' }}>
                    {t('buttons.returnToDashboard')}
                  </Button>
                </Box>
              </LeftArea>
              <RightArea>
                <Picture
                  src="/required.svg"
                  sx={theme => ({
                    display: 'none',
                    [theme.breakpoints.up('md')]: {
                      display: 'block',
                      marginTop: theme.spacing(4),
                    },
                  })}
                />
              </RightArea>
            </Container>
          </PageContentBlock>
        </PageContentColumn>
      </PageContent>
    </TopLevelLayout>
  );
};

export default AuthRequiredPage;
