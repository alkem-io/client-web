import { useEffect } from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import StopIcon from '@mui/icons-material/Stop';
import { useTranslation } from 'react-i18next';

interface PresentationModeControlsProps {
  currentSlideIndex: number;
  totalSlides: number;
  onPreviousSlide: () => void;
  onNextSlide: () => void;
  onSlideChange: (index: number) => void;
  onStop: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

/**
 * Overlay controls shown during presentation mode.
 * Displays navigation arrows, pagination, and stop button at the bottom of the screen.
 */
const PresentationModeControls = ({
  currentSlideIndex,
  totalSlides,
  onPreviousSlide,
  onNextSlide,
  onSlideChange,
  onStop,
  canGoPrevious,
  canGoNext,
}: PresentationModeControlsProps) => {
  const { t } = useTranslation();

  const previousSlideLabel = t('callout.whiteboard.slides.previousSlide') as string;
  const nextSlideLabel = t('callout.whiteboard.slides.nextSlide') as string;
  const stopPresentationLabel = t('callout.whiteboard.slides.stopPresentation') as string;

  // Keyboard navigation for presentation mode
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if typing in input/textarea (defensive check)
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Navigate to previous slide
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (canGoPrevious) {
          onPreviousSlide();
        }
      }
      // Navigate to next slide
      else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        if (canGoNext) {
          onNextSlide();
        }
      }
      // Space = next, Shift+Space = previous
      else if (event.key === ' ') {
        event.preventDefault();
        if (event.shiftKey) {
          if (canGoPrevious) {
            onPreviousSlide();
          }
        } else {
          if (canGoNext) {
            onNextSlide();
          }
        }
      }
      // Home = first slide
      else if (event.key === 'Home') {
        event.preventDefault();
        if (currentSlideIndex > 0) {
          onSlideChange(0);
        }
      }
      // End = last slide
      else if (event.key === 'End') {
        event.preventDefault();
        if (currentSlideIndex < totalSlides - 1) {
          onSlideChange(totalSlides - 1);
        }
      }
      // F = toggle fullscreen
      else if (event.key === 'f' || event.key === 'F') {
        event.preventDefault();
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          // Try to enter fullscreen on the presentation container
          const dialogContent = document.querySelector('[data-presentation-mode="true"]');
          if (dialogContent && 'requestFullscreen' in dialogContent) {
            (dialogContent as HTMLElement).requestFullscreen();
          }
        }
      }
      // ESC = stop presentation
      else if (event.key === 'Escape') {
        event.preventDefault();
        onStop();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onPreviousSlide, onNextSlide, onSlideChange, onStop, canGoPrevious, canGoNext, currentSlideIndex, totalSlides]);

  return (
    <Box
      sx={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        pointerEvents: 'none',
      }}
    >
      <Box
        sx={theme => ({
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          padding: theme.spacing(1, 3),
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          borderRadius: '8px 8px 0 0',
          pointerEvents: 'auto',
        })}
      >
        {/* Previous slide button */}
        <Tooltip title={previousSlideLabel} placement="top">
          <span>
            <IconButton
              onClick={onPreviousSlide}
              disabled={!canGoPrevious}
              aria-label={previousSlideLabel}
              size="small"
              sx={{
                color: 'white',
                '&.Mui-disabled': {
                  color: 'rgba(255, 255, 255, 0.3)',
                },
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
          </span>
        </Tooltip>

        {/* Pagination */}
        <Typography
          variant="body2"
          sx={{
            color: 'white',
            minWidth: 60,
            textAlign: 'center',
            userSelect: 'none',
          }}
        >
          {currentSlideIndex + 1} / {totalSlides}
        </Typography>

        {/* Next slide button */}
        <Tooltip title={nextSlideLabel} placement="top">
          <span>
            <IconButton
              onClick={onNextSlide}
              disabled={!canGoNext}
              aria-label={nextSlideLabel}
              size="small"
              sx={{
                color: 'white',
                '&.Mui-disabled': {
                  color: 'rgba(255, 255, 255, 0.3)',
                },
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          </span>
        </Tooltip>

        {/* Spacer */}
        <Box sx={{ width: 32 }} />

        {/* Stop presentation button */}
        <Tooltip title={stopPresentationLabel} placement="top">
          <IconButton
            onClick={onStop}
            aria-label={stopPresentationLabel}
            size="small"
            sx={theme => ({
              backgroundColor: theme.palette.error.main,
              color: 'white',
              '&:hover': {
                backgroundColor: theme.palette.error.dark,
              },
            })}
          >
            <StopIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default PresentationModeControls;
