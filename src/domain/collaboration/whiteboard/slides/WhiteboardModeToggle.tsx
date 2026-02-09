import { IconButton, Tooltip } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SlideshowOutlinedIcon from '@mui/icons-material/SlideshowOutlined';
import { useTranslation } from 'react-i18next';
import { WhiteboardMode } from './types';

interface WhiteboardModeToggleProps {
  mode: WhiteboardMode;
  onModeChange: (mode: WhiteboardMode) => void;
  disabled?: boolean;
}

/**
 * Toggle button for switching between whiteboard and slides mode.
 * Shows edit icon for whiteboard mode and copresent icon for slides mode.
 */
const WhiteboardModeToggle = ({ mode, onModeChange, disabled = false }: WhiteboardModeToggleProps) => {
  const { t } = useTranslation();

  const isWhiteboardMode = mode === 'whiteboard';

  const handleClick = () => {
    onModeChange(isWhiteboardMode ? 'slides' : 'whiteboard');
  };

  const tooltipTitle = isWhiteboardMode
    ? t('callout.whiteboard.slides.toggleToSlides')
    : t('callout.whiteboard.slides.toggleToWhiteboard');

  return (
    <Tooltip title={tooltipTitle} placement="bottom">
      <span>
        <IconButton
          onClick={handleClick}
          disabled={disabled}
          aria-label={tooltipTitle as string}
          aria-pressed={!isWhiteboardMode}
          size="small"
          sx={theme => ({
            color: isWhiteboardMode ? theme.palette.action.active : theme.palette.primary.main,
            backgroundColor: isWhiteboardMode ? 'transparent' : theme.palette.primary.light + '20',
            '&:hover': {
              backgroundColor: isWhiteboardMode ? theme.palette.action.hover : theme.palette.primary.light + '40',
            },
          })}
        >
          {isWhiteboardMode ? <SlideshowOutlinedIcon /> : <EditOutlinedIcon />}
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default WhiteboardModeToggle;
