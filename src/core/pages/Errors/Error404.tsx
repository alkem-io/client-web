import React, { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { log404NotFound } from '../../logging/sentry/log';
import useInnovationHubOutsideRibbon from '../../../domain/innovationHub/InnovationHubOutsideRibbon/useInnovationHubOutsideRibbon';
import TopLevelDesktopLayout from '../../../main/ui/layout/TopLevelDesktopLayout';
import PageContentBlock from '../../ui/content/PageContentBlock';
import { Box, Link, LinkProps, TextField, styled } from '@mui/material';
import ImageFadeIn from '../../ui/image/ImageFadeIn';
import { PageTitle, PlatformTitle, Tagline, Text } from '../../ui/typography';
import { EastOutlined, Search } from '@mui/icons-material';
import { useConfig } from '../../../domain/platform/config/useConfig';
import PageContent from '../../ui/content/PageContent';

const Container = styled(Box)(({ theme }) => ({
  margin: theme.spacing(2, 'auto', 2, 'auto'),
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
}));

const LeftArea = styled(Box)(({ theme }) => ({
  width: theme.spacing(55),
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}));

const RightArea = styled(Box)(({ theme }) => ({
  marginLeft: theme.spacing(-10),
  [theme.breakpoints.only('xs')]: {
    display: 'none',
  },
  [theme.breakpoints.down('md')]: {
    marginLeft: theme.spacing(-5),
    width: '100%',
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
  marginBottom: theme.spacing(20), // Empty white area after links, remove pixeles if you are modre links
  [theme.breakpoints.only('xs')]: {
    marginBottom: 0,
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  margin: theme.spacing(4, 0),
  width: '75%',
  [theme.breakpoints.only('xs')]: {
    width: '100%',
  },
}));

const StyledLink = ({ children, subtitle, ...props }: LinkProps & { subtitle: string }) => {
  return (
    <Box marginBottom={theme => theme.spacing(2)}>
      <Link {...props}>
        <PageTitle>
          {children} <EastOutlined sx={{ verticalAlign: 'middle' }} fontSize="small" />
        </PageTitle>
      </Link>
      <Text>{subtitle}</Text>
    </Box>
  );
};

export const Error404: FC = () => {
  useEffect(() => log404NotFound());
  const { t } = useTranslation();
  const { platform } = useConfig();

  return (
    <PageContent>
      <PageContentBlock>
        <Container>
          <LeftArea>
            <PlatformTitle>{t('pages.four-ou-four.title')}</PlatformTitle>
            <Picture src="/404.svg" sx={{ display: { xs: 'block', sm: 'none' } }} />
            <Tagline>{t('pages.four-ou-four.message')}</Tagline>
            <StyledTextField
              size="small"
              placeholder={t('common.search')}
              InputProps={{
                endAdornment: <Search color="primary" />,
              }}
              sx={{}}
            />
            <UsefulLinks>
              <StyledLink href="/" subtitle={'Small text'}>
                {t('common.home')}
              </StyledLink>
              <StyledLink href={platform?.help} subtitle={'Small text'}>
                {t('common.help-center')}
              </StyledLink>
            </UsefulLinks>
          </LeftArea>
          <RightArea>
            <Picture src="/404.svg" sx={{ display: 'block', xs: { display: 'none' } }} />
          </RightArea>
        </Container>
      </PageContentBlock>
    </PageContent>
  );
};
