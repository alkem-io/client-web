import { useTranslation } from 'react-i18next';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { Box, Link, LinkProps, styled } from '@mui/material';
import ImageFadeIn from '@/core/ui/image/ImageFadeIn';
import { PageTitle, Tagline, Text } from '@/core/ui/typography';
import { EastOutlined } from '@mui/icons-material';
import { useConfig } from '@/domain/platform/config/useConfig';
import SearchBar from '@/main/ui/layout/topBar/SearchBar';
import PageContent from '@/core/ui/content/PageContent';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import { gutters } from '@/core/ui/grid/utils';
import { NAVIGATION_CONTAINER_HEIGHT_GUTTERS } from '@/core/ui/navigation/NavigationBar';

export const Container = styled(Box)(({ theme }) => ({
  margin: theme.spacing(2, 'auto', 2, 'auto'),
  display: 'flex',
  flexDirection: 'row',
}));

export const LeftArea = styled(Box)(({ theme }) => ({
  width: theme.spacing(50),
  [theme.breakpoints.down('md')]: {
    width: '75%',
    margin: theme.spacing(0, 'auto'),
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}));

export const RightArea = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

export const Picture = styled(ImageFadeIn)(({ theme }) => ({
  width: theme.spacing(68),
  [theme.breakpoints.down('lg')]: {
    width: theme.spacing(50),
  },
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
  [theme.breakpoints.only('xs')]: {
    width: '80%',
    margin: theme.spacing(2, 'auto', 2, 'auto'),
  },
}));

const UsefulLinks = styled(Box)(() => ({
  width: '75%',
}));

const StyledSearchBox = styled(SearchBar)(({ theme }) => ({
  margin: theme.spacing(4, 0),
  width: '75%',
  [theme.breakpoints.down('md')]: { width: '100%' },
}));

const StyledLink = ({ children, subtitle, ...props }: LinkProps & { subtitle?: string }) => {
  return (
    <Box marginBottom={theme => theme.spacing(2)}>
      <Link {...props}>
        <PageTitle>
          {children} <EastOutlined sx={{ verticalAlign: 'middle' }} fontSize="small" />
        </PageTitle>
      </Link>
      {subtitle && <Text>{subtitle}</Text>}
    </Box>
  );
};

export const Error403 = () => {
  const { t } = useTranslation();
  const { locations } = useConfig();

  return (
    <PageContent gridContainerProps={{ sx: { paddingTop: gutters(NAVIGATION_CONTAINER_HEIGHT_GUTTERS) } }}>
      <PageContentColumn columns={12}>
        <PageContentBlock>
          <Container>
            <LeftArea>
              <PageTitle component="h1" sx={theme => ({ [theme.breakpoints.down('md')]: { textAlign: 'center' } })}>
                {t('pages.four-ou-four.title')}
              </PageTitle>
              <Picture
                src="/404.svg"
                sx={theme => ({
                  marginBottom: theme.spacing(2),
                  display: 'block',
                  [theme.breakpoints.up('md')]: { display: 'none' },
                })}
              />
              <Tagline sx={{ marginTop: gutters(2) }}>{t('pages.four-ou-four.message')}</Tagline>
              <StyledSearchBox withRedirect />
              <UsefulLinks>
                <StyledLink href="/" subtitle={t('pages.four-ou-four.links.home')}>
                  {t('common.home')}
                </StyledLink>
                <StyledLink href={locations?.help} subtitle={t('pages.four-ou-four.links.faq')}>
                  {t('common.helpCenter')}
                </StyledLink>
              </UsefulLinks>
            </LeftArea>
            <RightArea>
              <Picture
                src="/404.svg"
                sx={theme => ({ display: 'none', [theme.breakpoints.up('md')]: { display: 'block' } })}
              />
            </RightArea>
          </Container>
        </PageContentBlock>
      </PageContentColumn>
    </PageContent>
  );
};
