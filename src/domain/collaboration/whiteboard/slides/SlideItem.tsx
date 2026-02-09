import { Box, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { SlideInfo } from './types';

interface SlideItemProps {
  slide: SlideInfo;
  isActive: boolean;
  onClick: () => void;
}

/**
 * Individual slide thumbnail component.
 * Shows slide number, thumbnail preview, and highlights when active.
 */
const SlideItem = ({ slide, isActive, onClick }: SlideItemProps) => {
  const { t } = useTranslation();

  const slideNumber = slide.index + 1;
  const slideLabel = slide.name || t('callout.whiteboard.slides.slideNumber', { number: slideNumber });

  return (
    <Box
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={slideLabel as string}
      aria-current={isActive ? 'true' : undefined}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      sx={theme => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        border: `2px solid ${isActive ? theme.palette.primary.main : theme.palette.divider}`,
        borderRadius: 1,
        backgroundColor: isActive ? theme.palette.primary.light + '20' : theme.palette.background.paper,
        cursor: 'pointer',
        overflow: 'hidden',
        transition: theme.transitions.create(['border-color', 'background-color', 'box-shadow'], {
          duration: theme.transitions.duration.short,
        }),
        '&:hover': {
          borderColor: theme.palette.primary.main,
          backgroundColor: theme.palette.action.hover,
        },
        '&:focus-visible': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
        },
      })}
    >
      {/* Thumbnail area */}
      <Box
        sx={{
          width: '100%',
          aspectRatio: '16 / 9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'background.default',
        }}
      >
        {slide.thumbnailDataUrl ? (
          <img
            src={slide.thumbnailDataUrl}
            alt={slideLabel as string}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        ) : (
          <CircularProgress size={16} />
        )}
      </Box>
      {/* Slide number and name */}
      <Box sx={{ py: 0.5, px: 1, width: '100%', textAlign: 'center' }}>
        <Typography
          variant="caption"
          component="span"
          sx={theme => ({
            color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
            fontWeight: isActive ? 600 : 400,
          })}
        >
          {slideNumber}
        </Typography>
        {slide.name && (
          <Typography
            variant="caption"
            component="span"
            sx={theme => ({
              color: theme.palette.text.secondary,
              ml: 0.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            })}
          >
            - {slide.name}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default SlideItem;
