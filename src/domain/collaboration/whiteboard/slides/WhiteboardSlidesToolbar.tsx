import { useEffect } from 'react';
import { Box, IconButton, Tooltip, Typography, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useTranslation } from 'react-i18next';
import { SlideInfo } from './types';
import SlideItem from './SlideItem';
import './WhiteboardSlidesToolbar.css';

interface WhiteboardSlidesToolbarProps {
  slides: SlideInfo[];
  currentSlideIndex: number;
  onSlideSelect: (index: number) => void;
  onAddSlide: () => void;
  onPreviousSlide: () => void;
  onNextSlide: () => void;
  onStartPresentation: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  isReadOnly?: boolean;
}

/**
 * Right sidebar toolbar for slides mode.
 * Shows numbered slide thumbnails, add button, and navigation controls.
 */
const WhiteboardSlidesToolbar = ({
  slides,
  currentSlideIndex,
  onSlideSelect,
  onAddSlide,
  onPreviousSlide,
  onNextSlide,
  onStartPresentation,
  canGoPrevious,
  canGoNext,
  isReadOnly = false,
}: WhiteboardSlidesToolbarProps) => {
  const { t } = useTranslation();

  // Keyboard navigation for slides
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle if not in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        onPreviousSlide();
      } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        onNextSlide();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onPreviousSlide, onNextSlide]);

  const modeLabel = t('callout.whiteboard.slides.modeSlides') as string;
  const noSlidesLabel = t('callout.whiteboard.slides.noSlides') as string;
  const addSlideLabel = t('callout.whiteboard.slides.addSlide') as string;
  const previousSlideLabel = t('callout.whiteboard.slides.previousSlide') as string;
  const nextSlideLabel = t('callout.whiteboard.slides.nextSlide') as string;
  const startPresentationLabel = t('callout.whiteboard.slides.startPresentation') as string;

  return (
    <Box className="whiteboard-slides-toolbar" role="complementary" aria-label={modeLabel}>
      {/* Slides list */}
      <Box className="whiteboard-slides-toolbar__list">
        {slides.length === 0 ? (
          <Box className="whiteboard-slides-toolbar__empty">
            <Typography variant="body2" color="text.secondary" textAlign="center">
              {noSlidesLabel}
            </Typography>
          </Box>
        ) : (
          slides.map(slide => (
            <Box key={slide.id} className="whiteboard-slides-toolbar__item">
              <SlideItem
                slide={slide}
                isActive={slide.index === currentSlideIndex}
                onClick={() => onSlideSelect(slide.index)}
              />
            </Box>
          ))
        )}
      </Box>

      {/* Actions: Add slide and Start presentation buttons */}
      <Divider />
      <Box
        className="whiteboard-slides-toolbar__actions"
        sx={{ display: 'flex', gap: 1, p: 1.5, justifyContent: 'center' }}
      >
        {!isReadOnly && (
          <Tooltip title={addSlideLabel} placement="top">
            <IconButton size="small" onClick={onAddSlide} aria-label={addSlideLabel}>
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title={startPresentationLabel} placement="top">
          <span>
            <IconButton
              size="small"
              onClick={onStartPresentation}
              disabled={slides.length === 0}
              aria-label={startPresentationLabel}
              sx={theme => ({
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
                '&.Mui-disabled': {
                  backgroundColor: theme.palette.action.disabledBackground,
                  color: theme.palette.action.disabled,
                },
              })}
            >
              <PlayArrowIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {/* Navigation controls */}
      <Divider />
      <Box className="whiteboard-slides-toolbar__navigation">
        <Tooltip title={previousSlideLabel} placement="top">
          <span>
            <IconButton
              onClick={onPreviousSlide}
              disabled={!canGoPrevious}
              aria-label={previousSlideLabel}
              size="small"
            >
              <ChevronLeftIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 60, textAlign: 'center' }}>
          {slides.length > 0 ? `${currentSlideIndex + 1} / ${slides.length}` : '0 / 0'}
        </Typography>
        <Tooltip title={nextSlideLabel} placement="top">
          <span>
            <IconButton onClick={onNextSlide} disabled={!canGoNext} aria-label={nextSlideLabel} size="small">
              <ChevronRightIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default WhiteboardSlidesToolbar;
