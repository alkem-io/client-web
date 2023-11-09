import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Tooltip } from '@mui/material';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';

const DisabledUseButton: FC<{}> = () => {
  const { t } = useTranslation();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  return (
    <Tooltip
      title={t('pages.innovationLibrary.useTemplateButton')}
      open={tooltipOpen}
      onOpen={() => setTooltipOpen(true)}
      onClose={() => setTooltipOpen(false)}
      arrow
    >
      <Box onClick={() => setTooltipOpen(true)}>
        <Button
          startIcon={<SystemUpdateAltIcon />}
          disabled
          variant="contained"
          sx={{ marginLeft: theme => theme.spacing(1) }}
        >
          {t('buttons.use')}
        </Button>
      </Box>
    </Tooltip>
  );
};

export default DisabledUseButton;
