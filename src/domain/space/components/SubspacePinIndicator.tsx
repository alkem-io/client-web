import { Paper } from '@mui/material';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import { useTranslation } from 'react-i18next';
import { type FC } from 'react';

type SubspacePinIndicatorProps = {
  withBackground?: boolean;
};

const SubspacePinIndicator: FC<SubspacePinIndicatorProps> = ({ withBackground = false }) => {
  const { t } = useTranslation();

  if (withBackground) {
    return (
      <Paper
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 20,
          height: 20,
          borderRadius: 0.5,
        }}
        aria-label={t('components.subspacePinIndicator.tooltip')}
      >
        <PushPinOutlinedIcon sx={{ fontSize: 14 }} color="primary" />
      </Paper>
    );
  }

  return (
    <PushPinOutlinedIcon
      sx={{ fontSize: 14 }}
      color="primary"
      aria-label={t('components.subspacePinIndicator.tooltip')}
    />
  );
};

export default SubspacePinIndicator;
