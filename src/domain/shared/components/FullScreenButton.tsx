import { Fullscreen, FullscreenExit } from '@mui/icons-material';
import { IconButton, IconButtonProps } from '@mui/material';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

interface FullscreenButtonProps {
  isFullscreen: boolean;
  onClick: IconButtonProps['onClick'];
}

const FullscreenButton: FC<FullscreenButtonProps> = ({ isFullscreen, onClick }) => {
  const { t } = useTranslation();
  return (
    <IconButton onClick={onClick} title={t('buttons.fullscreen')} color="primary">
      {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
    </IconButton>
  );
};

export default FullscreenButton;
