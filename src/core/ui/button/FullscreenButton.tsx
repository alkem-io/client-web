import { Fullscreen, FullscreenExit } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useFullscreen } from '../fullscreen/useFullscreen';
import { useEffect } from 'react';

interface FullscreenButtonProps {
  element?: HTMLElement;
  onChange?: (state: boolean) => void;
  forceExit?: boolean; // New prop to declaratively control exit
}

const FullscreenButton = ({ element, onChange, forceExit = false }: FullscreenButtonProps) => {
  const { t } = useTranslation();
  const { fullscreen, setFullscreen } = useFullscreen(element);

  // Declaratively handle forced exit
  useEffect(() => {
    if (forceExit && fullscreen) {
      setFullscreen(false);
      onChange?.(false);
    }
  }, [forceExit, fullscreen, setFullscreen, onChange]);

  const handleClick = () => {
    setFullscreen(!fullscreen);
    onChange?.(!fullscreen);
  };

  return (
    <IconButton
      onClick={handleClick}
      title={t('buttons.fullscreen')}
      aria-label={t('buttons.fullscreen')}
      color="primary"
    >
      {fullscreen ? <FullscreenExit /> : <Fullscreen />}
    </IconButton>
  );
};

export default FullscreenButton;
