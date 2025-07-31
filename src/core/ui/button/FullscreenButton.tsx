import { Fullscreen, FullscreenExit } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useFullscreen } from '../fullscreen/useFullscreen';
interface FullscreenButtonProps {
  element?: HTMLElement;
  onChange?: (state: boolean) => void;
}

const FullscreenButton = ({ element, onChange }: FullscreenButtonProps) => {
  const { t } = useTranslation();
  const { fullscreen, setFullscreen } = useFullscreen(element);

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
