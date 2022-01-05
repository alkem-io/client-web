import { Avatar, Box, Typography, useTheme } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardGenericSection from '../../components/composite/common/sections/DashboardGenericSection';
import { SectionProps, SectionSpacer } from '../../components/core/Section/Section';
import HandymanIcon from '@mui/icons-material/Handyman';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';

const ShowInterestSection: FC<{
  classes?: SectionProps['classes'];
}> = ({ classes }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <DashboardGenericSection
      headerText={t('pages.home.sections.interested-in-collaboration.header')}
      // primaryAction={
      //   <Button LinkComponent={'a'} href={platform?.feedback || ''} target="_blank" sx={{ flexShrink: 0 }}>
      //     Contact us
      //   </Button>
      // }
      classes={classes}
    >
      <Box display="flex" alignItems="center">
        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
          <ConnectWithoutContactIcon sx={{ color: theme.palette.background.default }} />
        </Avatar>
        <SectionSpacer />
        <Typography
          variant="body1"
          dangerouslySetInnerHTML={{
            __html: t('pages.home.sections.interested-in-collaboration.innovation-facilitator'),
          }}
        />
      </Box>
      <SectionSpacer />
      <Box display="flex" alignItems="center">
        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
          <LightbulbIcon sx={{ color: theme.palette.background.default }} />
        </Avatar>
        <SectionSpacer />
        <Typography
          variant="body1"
          dangerouslySetInnerHTML={{
            __html: t('pages.home.sections.interested-in-collaboration.suggestions'),
          }}
        />
      </Box>
      <SectionSpacer />
      <Box display="flex" alignItems="center">
        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
          <HandymanIcon sx={{ color: theme.palette.background.default }} />
        </Avatar>
        <SectionSpacer />
        <Typography
          variant="body1"
          dangerouslySetInnerHTML={{
            __html: t('pages.home.sections.interested-in-collaboration.contributor'),
          }}
        />
      </Box>
    </DashboardGenericSection>
  );
};

export default ShowInterestSection;
