import { Avatar, Box, Typography, useTheme } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardGenericSection from '../../components/composite/common/sections/DashboardGenericSection';
import { SectionProps, SectionSpacer } from '../../components/core/Section/Section';
import HandymanIcon from '@mui/icons-material/Handyman';

import HelpIcon from '@mui/icons-material/Help';

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
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography
          variant="body1"
          dangerouslySetInnerHTML={{
            __html: t('pages.home.sections.interested-in-collaboration.body'),
          }}
        />
      </Box>
      <SectionSpacer />
      <Box display="flex" alignItems="center">
        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
          <HelpIcon sx={{ color: theme.palette.background.default }} />
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
