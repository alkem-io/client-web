import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, IconButton, lighten } from '@mui/material';
import { Add } from '@mui/icons-material';
import SwapColors from '@core/ui/palette/SwapColors';
import { CaptionSmall } from '@core/ui/typography';

interface CalloutBlockFooterProps {
  contributionsCount: number;
  onCreate: () => void;
}

const CalloutBlockFooter = ({ contributionsCount, onCreate }: CalloutBlockFooterProps) => {
  const { t } = useTranslation();

  return (
    <Box display="flex" justifyContent="space-between" alignItems="start">
      <CaptionSmall>{t('callout.contributions', { count: contributionsCount })}</CaptionSmall>
      <SwapColors>
        <IconButton
          color="primary"
          size="large"
          onClick={onCreate}
          aria-label={t('common.add')}
          sx={{
            backgroundColor: 'background.paper',
            ':hover': theme => ({
              backgroundColor: lighten(theme.palette.background.paper, 0.1),
            }),
          }}
        >
          <Add />
        </IconButton>
      </SwapColors>
    </Box>
  );
};

export default CalloutBlockFooter;
