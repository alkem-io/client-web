import { Fullscreen, FullscreenExit } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useFullscreen } from '../fullscreen/useFullscreen';

const FullscreenButton = ({ element }: { element?: HTMLElement }) => {
  const { t } = useTranslation();
  const { fullscreen, setFullscreen } = useFullscreen(element);

  return (
    <IconButton
      onClick={() => setFullscreen(!fullscreen)}
      title={t('buttons.fullscreen')}
      aria-label={t('buttons.fullscreen')}
      color="primary"
    >
      {fullscreen ? <FullscreenExit /> : <Fullscreen />}
    </IconButton>
  );
};

export default FullscreenButton;
