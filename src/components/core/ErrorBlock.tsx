import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import ReportGmailerrorred from '@mui/icons-material/ReportGmailerrorred';
import Typography from './Typography';
import { Box, Grid } from '@mui/material';

const ErrorBlock: FC<{ blockName: string }> = ({ blockName }) => {
  const { t } = useTranslation();
  return (
    <Grid container justifyContent={'center'} alignItems={'center'}>
      <ReportGmailerrorred fontSize="large" color="warning" />
      <Box marginLeft={3}>
        <Typography variant={'h5'} color={'neutralMedium'}>
          {t('components.errorblock.message', { blockName: blockName.toLocaleLowerCase() })}
        </Typography>
      </Box>
    </Grid>
  );
};
export default ErrorBlock;
