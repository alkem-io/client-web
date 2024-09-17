import React, { useState } from 'react';
import { Box, Tooltip } from '@mui/material';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import { useTranslation } from 'react-i18next';
import { LoadingButton } from '@mui/lab';
import useLoadingState from '../../../../shared/utils/useLoadingState';

interface UseTemplateButtonProps {
  onClick?: () => Promise<unknown>;
  disabled?: boolean;
}

//!! not used, but probably should
const UseTemplateButton = ({ onClick, disabled }: UseTemplateButtonProps) => {
  const { t } = useTranslation();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [handleClick, loading] = useLoadingState(async () => {
    await onClick?.();
  });

  return (
    <Tooltip
      title={t('pages.innovationLibrary.useTemplateButton')}
      open={tooltipOpen}
      onOpen={() => setTooltipOpen(true)}
      onClose={() => setTooltipOpen(false)}
      arrow
    >
      <Box onClick={() => setTooltipOpen(true)}>
        <LoadingButton
          startIcon={<SystemUpdateAltIcon />}
          disabled={disabled}
          variant="contained"
          sx={{ marginLeft: theme => theme.spacing(1) }}
          onClick={handleClick}
          loading={loading}
        >
          {t('buttons.use')}
        </LoadingButton>
      </Box>
    </Tooltip>
  );
};

export default UseTemplateButton;
