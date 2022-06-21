import { Avatar, Box, Typography, useTheme } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardGenericSection from '../../components/composite/common/sections/DashboardGenericSection';
import { SectionProps, SectionSpacer } from '../../domain/shared/components/Section/Section';
import HandymanIcon from '@mui/icons-material/Handyman';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';
import { TranslateWithElements } from '../../domain/shared/i18n/TranslateWithElements';
import HomePageLink from './HomePageLink';

const tLinks = TranslateWithElements(<HomePageLink target="_blank" />);

const ShowInterestSection: FC<{
  classes?: SectionProps['classes'];
}> = ({ classes }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <DashboardGenericSection headerText={t('pages.home.sections.interested-in-collaboration.header')} classes={classes}>
      <Box display="flex" alignItems="center">
        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
          <ConnectWithoutContactIcon sx={{ color: theme.palette.background.default }} />
        </Avatar>
        <SectionSpacer />
        <Typography variant="body1">
          {tLinks('pages.home.sections.interested-in-collaboration.innovation-facilitator', {
            feedback: { href: 'https://alkem.io/feedback' },
          })}
        </Typography>
      </Box>
      <SectionSpacer />
      <Box display="flex" alignItems="center">
        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
          <LightbulbIcon sx={{ color: theme.palette.background.default }} />
        </Avatar>
        <SectionSpacer />
        <Typography variant="body1">
          {tLinks('pages.home.sections.interested-in-collaboration.suggestions', {
            discussions: { href: 'https://github.com/alkem-io/alkemio/discussions' },
          })}
        </Typography>
      </Box>
      <SectionSpacer />
      <Box display="flex" alignItems="center">
        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
          <HandymanIcon sx={{ color: theme.palette.background.default }} />
        </Avatar>
        <SectionSpacer />
        <Typography variant="body1">
          {tLinks('pages.home.sections.interested-in-collaboration.contributor', {
            github: { href: 'https://github.com/alkem-io' },
            website: { href: 'https://alkem.io' },
          })}
        </Typography>
      </Box>
    </DashboardGenericSection>
  );
};

export default ShowInterestSection;
