import { Fullscreen, FullscreenExit } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useFullscreen } from '../fullscreen/useFullscreen';

interface FullscreenButtonProps {
  element?: HTMLElement;
}

const FullscreenButton: FC<FullscreenButtonProps> = ({ element }) => {
  const { t } = useTranslation();
  const { fullscreen, toggleFullscreen } = useFullscreen(element);

  return (
    <IconButton onClick={toggleFullscreen} title={t('buttons.fullscreen')} color="primary">
      {fullscreen ? <FullscreenExit /> : <Fullscreen />}
    </IconButton>
  );
};

export default FullscreenButton;
