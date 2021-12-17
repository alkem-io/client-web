import { Box, Button, Typography } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardGenericSection from '../../components/composite/common/sections/DashboardGenericSection';
import { SectionProps } from '../../components/core/Section/Section';
import { useConfig } from '../../hooks';

const ShowInterestSection: FC<{
  classes?: SectionProps['classes'];
}> = ({ classes }) => {
  const { platform } = useConfig();
  const { t } = useTranslation();

  return (
    <DashboardGenericSection
      headerText={t('pages.home.sections.interested-in-collaboration.header')}
      primaryAction={
        <Button LinkComponent={'a'} href={platform?.feedback || ''} target="_blank" sx={{ flexShrink: 0 }}>
          Contact us
        </Button>
      }
      classes={classes}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography
          variant="body1"
          dangerouslySetInnerHTML={{
            __html: t('pages.home.sections.interested-in-collaboration.body'),
          }}
        />
        {/* <SectionSpacer double />
        <Button LinkComponent={'a'} href={platform?.feedback || ''} target="_blank" sx={{ flexShrink: 0 }}>
          Contact us
        </Button> */}
      </Box>
    </DashboardGenericSection>
  );
};

export default ShowInterestSection;
