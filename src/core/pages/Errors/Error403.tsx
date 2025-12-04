import { Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { gutters } from '@/core/ui/grid/utils';
import { NAVIGATION_CONTAINER_HEIGHT_GUTTERS } from '@/core/ui/navigation/NavigationBar';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { PageTitle, Tagline } from '@/core/ui/typography';
import PageContent from '@/core/ui/content/PageContent';
import { Container, LeftArea, Picture, RightArea } from '@/core/pages/Errors/Error404';
import { TopLevelRoutePath } from '@/main/routing/TopLevelRoutePath';

export const Error403 = () => {
  const { t } = useTranslation();
  const homeUrl = `/${TopLevelRoutePath.Home}`;

  return (
    <PageContent gridContainerProps={{ sx: { paddingTop: gutters(NAVIGATION_CONTAINER_HEIGHT_GUTTERS) } }}>
      <PageContentColumn columns={12}>
        <PageContentBlock>
          <Container>
            <LeftArea>
              <PageTitle component="h1" sx={theme => ({ [theme.breakpoints.down('md')]: { textAlign: 'center' } })}>
                {t('pages.unauthorized.header')}
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
              <Tagline sx={{ marginTop: gutters(2) }}>{t('pages.unauthorized.subheader')}</Tagline>
              <Tagline sx={{ marginTop: gutters(0.5) }}>{t('pages.unauthorized.subheader2')}</Tagline>
              <Box display="flex" flexDirection="column" alignItems="center" marginTop={gutters(2)} gap={2}>
                <Button component={Link} to={homeUrl} variant="contained" color="primary" sx={{ minWidth: '70%' }}>
                  {t('buttons.takeMeHome')}
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
  );
};

export default Error403;
