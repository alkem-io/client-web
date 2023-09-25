import { Fullscreen, FullscreenExit } from '@mui/icons-material';
import { IconButton, IconButtonProps } from '@mui/material';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

interface FullscreenButtonProps {
  isFullscreen: boolean;
  onClick: IconButtonProps['onClick'];
}

function openFullscreen() {
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen();
  }
}
function closeFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  }
}

const FullscreenButton: FC<FullscreenButtonProps> = ({ isFullscreen, onClick }) => {
  const { t } = useTranslation();
  const handleClick = event => {
    if (isFullscreen) {
      closeFullscreen();
    } else {
      openFullscreen();
    }
    onClick?.(event);
  };
  return (
    <IconButton onClick={handleClick} title={t('buttons.fullscreen')} color="primary">
      {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
    </IconButton>
  );
};

export default FullscreenButton;
