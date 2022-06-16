import { Avatar, Box, Typography, useTheme } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import DashboardGenericSection from '../../components/composite/common/sections/DashboardGenericSection';
import FlagIcon from '@mui/icons-material/Flag';
import { SectionSpacer } from '../../components/core/Section/Section';
import PersonIcon from '@mui/icons-material/Person';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import { TranslateWithElements } from '../../domain/shared/i18n/TranslateWithElements';
import HomePageLink from './HomePageLink';

const tLinks = TranslateWithElements(<HomePageLink />);

const GettingStartedSection = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <DashboardGenericSection
      headerText={t('pages.home.sections.getting-started.header')}
      subHeaderText={t('pages.home.sections.getting-started.subheader')}
    >
      <Box display="flex" alignItems="center">
        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
          <FlagIcon sx={{ color: theme.palette.background.default }} />
        </Avatar>
        <SectionSpacer />
        <Typography variant="body1">
          {tLinks('pages.home.sections.getting-started.joining-a-challenge', {
            challenges: { href: '/challenges' },
          })}
        </Typography>
      </Box>
      <SectionSpacer />
      <Box display="flex" alignItems="center">
        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
          <OndemandVideoIcon sx={{ color: theme.palette.background.default }} />
        </Avatar>
        <SectionSpacer />
        <Typography variant="body1">
          {tLinks('pages.home.sections.getting-started.introduction-video', {
            video: {
              href: 'https://vimeo.com/708623032?utm_campaign=2022VIDEO&utm_source=VIDEO&utm_medium=VIMEO&utm_term=clicks&utm_content=2022VIDEOHOWTO',
              target: '_blank',
            },
          })}
        </Typography>
      </Box>
      <SectionSpacer />
      <Box display="flex" alignItems="center">
        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
          <PersonIcon sx={{ color: theme.palette.background.default }} />
        </Avatar>
        <SectionSpacer />
        <Typography variant="body1">
          {tLinks('pages.home.sections.getting-started.your-profile', {
            profile: { href: '/profile' },
          })}
        </Typography>
      </Box>
    </DashboardGenericSection>
  );
};

export default GettingStartedSection;
