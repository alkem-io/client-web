import React, { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { log404NotFound } from '../../logging/sentry/log';
import PageContentBlock from '../../ui/content/PageContentBlock';
import { Box, Link, LinkProps, styled } from '@mui/material';
import ImageFadeIn from '../../ui/image/ImageFadeIn';
import { PageTitle, PlatformTitle, Tagline, Text } from '../../ui/typography';
import { EastOutlined } from '@mui/icons-material';
import { useConfig } from '@domain/platform/config/useConfig';
import SearchBar from '@main/ui/layout/topBar/SearchBar';
import PageContent from '../../ui/content/PageContent';
import PageContentColumn from '../../ui/content/PageContentColumn';
import { gutters } from '../../ui/grid/utils';
import { NAVIGATION_CONTAINER_HEIGHT_GUTTERS } from '../../ui/navigation/NavigationBar';
import { useLocation } from 'react-router-dom';

const Container = styled(Box)(({ theme }) => ({
  margin: theme.spacing(2, 'auto', 2, 'auto'),
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
}));

const LeftArea = styled(Box)(({ theme }) => ({
  width: theme.spacing(56),
  [theme.breakpoints.down('md')]: {
    width: '75%',
    margin: theme.spacing(0, 'auto'),
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}));

const RightArea = styled(Box)(({ theme }) => ({
  marginLeft: theme.spacing(-10),
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

const Picture = styled(ImageFadeIn)(({ theme }) => ({
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

const UsefulLinks = styled(Box)(({ theme }) => ({
  width: '75%',
  marginBottom: theme.spacing(20), // Empty white area after links, remove pixeles if you are modre links
  [theme.breakpoints.only('xs')]: {
    marginBottom: 0,
  },
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

export const Error404: FC = () => {
  const { pathname } = useLocation();

  useEffect(() => log404NotFound(), [pathname]);

  const { t } = useTranslation();
  const { locations } = useConfig();

  return (
    <PageContent gridContainerProps={{ sx: { paddingTop: gutters(NAVIGATION_CONTAINER_HEIGHT_GUTTERS) } }}>
      <PageContentColumn columns={12}>
        <PageContentBlock>
          <Container>
            <LeftArea>
              <PlatformTitle sx={theme => ({ [theme.breakpoints.down('md')]: { textAlign: 'center' } })}>
                {t('pages.four-ou-four.title')}
              </PlatformTitle>
              <Picture
                src="/404.svg"
                sx={theme => ({
                  marginBottom: theme.spacing(2),
                  display: 'block',
                  [theme.breakpoints.up('md')]: { display: 'none' },
                })}
              />
              <Tagline>{t('pages.four-ou-four.message')}</Tagline>
              <StyledSearchBox />
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
