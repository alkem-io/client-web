import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as ErrorIcon } from 'bootstrap-icons/icons/exclamation-octagon.svg';
import Icon from './Icon';
import Typography from './Typography';
import { Box, Grid } from '@material-ui/core';

const ErrorBlock: FC<{ blockName: string }> = ({ blockName }) => {
  const { t } = useTranslation();
  return (
    <Grid container justifyContent={'center'} alignItems={'center'}>
      <Icon component={ErrorIcon} size={'xl'} color={'neutralMedium'} />
      <Box marginLeft={3}>
        <Typography variant={'h5'} color={'neutralMedium'}>
          {t('components.errorblock.message', { blockName: blockName.toLocaleLowerCase() })}
        </Typography>
      </Box>
    </Grid>
  );
};
export default ErrorBlock;
