import { useRef, useEffect } from 'react';
import { Box, IconButton, Popover, Tooltip, Typography } from '@mui/material';
import AddReactionOutlinedIcon from '@mui/icons-material/AddReactionOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import EmojiReactionGrid from './EmojiReactionGrid';
import { useEmojiReactionConfiguration } from '../reactionEmoji/useEmojiReactionConfiguration';
import { useEmojiReactionPickerState } from '../reactionEmoji/useEmojiReactionPickerState';
import { EmojiReactionPlacementInfo, SceneCoordinates } from '../reactionEmoji/types';

interface WhiteboardEmojiReactionPickerProps {
  /**
   * Callback when an emoji should be placed on the canvas.
   * Called with the emoji character and coordinates (to be provided by canvas click).
   * Optional - parent handles this via canvas click integration.
   */
  onEmojiPlace?: (emoji: string, coordinates: SceneCoordinates) => void;

  /**
   * Whether the picker is disabled (e.g., read-only mode).
   */
  disabled?: boolean;

  /**
   * Optional className for positioning/styling.
   */
  className?: string;

  /**
   * Callback when entering/exiting placement mode.
   * Parent uses this to track placement state and handle canvas clicks.
   */
  onPlacementModeChange?: (placementInfo: EmojiReactionPlacementInfo | null) => void;

  /**
   * Current placement info from parent. When this becomes null while picker
   * is in placing mode, it signals that placement was completed externally
   * and the picker should reset its internal state.
   */
  emojiPlacementInfo?: EmojiReactionPlacementInfo | null;
}

/**
 * Whiteboard emoji reaction picker component.
 *
 * Provides a toolbar button that opens a popover with emoji options.
 * When an emoji is selected, the component enters "placement mode"
 * waiting for a canvas click to place the emoji.
 *
 * @example
 * ```tsx
 * <WhiteboardEmojiReactionPicker
 *   onEmojiPlace={(emoji, coords) => {
 *     addEmojiToCanvas(emoji, coords.x, coords.y);
 *   }}
 *   disabled={isReadOnly}
 * />
 * ```
 */
const WhiteboardEmojiReactionPicker = ({
  onEmojiPlace,
  disabled = false,
  className,
  onPlacementModeChange,
  emojiPlacementInfo,
}: WhiteboardEmojiReactionPickerProps) => {
  const { t } = useTranslation();
  const config = useEmojiReactionConfiguration();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const firstEmojiRef = useRef<HTMLButtonElement>(null);

  const {
    isOpen,
    isPlacing,
    selectedEmoji,
    openPicker,
    selectEmoji,
    placeEmoji,
    cancel,
  } = useEmojiReactionPickerState();

  // Reset picker state when parent signals placement is complete
  // This happens when emojiPlacementInfo becomes null while we're still in placing mode
  useEffect(() => {
    if (isPlacing && emojiPlacementInfo === null) {
      // Parent handled placement, reset our internal state
      placeEmoji();
    }
  }, [emojiPlacementInfo, isPlacing, placeEmoji]);

  // Notify parent when placement mode changes
  useEffect(() => {
    if (isPlacing && selectedEmoji) {
      onPlacementModeChange?.({
        isActive: true,
        emoji: selectedEmoji,
      });
    } else {
      onPlacementModeChange?.(null);
    }
  }, [isPlacing, selectedEmoji, onPlacementModeChange]);

  // Focus first emoji when picker opens
  useEffect(() => {
    if (isOpen && firstEmojiRef.current) {
      // Use setTimeout to ensure popover is rendered
      setTimeout(() => {
        firstEmojiRef.current?.focus();
      }, 0);
    }
  }, [isOpen]);

  // Handle keyboard escape to cancel
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && (isOpen || isPlacing)) {
        cancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPlacing, cancel]);

  // Hide picker if no valid configuration
  if (!config) {
    return null;
  }

  const handleButtonClick = () => {
    if (isPlacing) {
      // If already placing, cancel and return to normal
      cancel();
    } else if (isOpen) {
      // If picker is open, close it
      cancel();
    } else {
      // Open the picker
      openPicker();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    selectEmoji(emoji);
    // Picker closes automatically when emoji is selected (via state change)
  };

  const handleClose = () => {
    cancel();
  };

  /**
   * This method should be called by the parent when the canvas is clicked
   * during placement mode. It completes the placement flow.
   */
  const handleCanvasClick = (coordinates: SceneCoordinates) => {
    if (isPlacing && selectedEmoji) {
      onEmojiPlace?.(selectedEmoji, coordinates);
      placeEmoji();
    }
  };

  // Expose handleCanvasClick via a custom attribute for parent integration
  // This is a workaround since we can't directly pass a ref up
  // The parent will need to call this when canvas is clicked
  const pickerState = {
    isPlacing,
    selectedEmoji,
    handleCanvasClick,
    cancel,
  };

  return (
    <Box className={className} data-emoji-picker-state={JSON.stringify({ isPlacing, selectedEmoji })}>
      <Tooltip
        title={
          isPlacing
            ? t('whiteboard.emojiReaction.clickToPlace', 'Click on canvas to place {{emoji}}', {
                emoji: selectedEmoji,
              })
            : t('whiteboard.emojiReaction.addEmoji', 'Add emoji reaction')
        }
        placement="top"
      >
        <span>
          <IconButton
            ref={buttonRef}
            onClick={handleButtonClick}
            disabled={disabled}
            aria-label={t('whiteboard.emojiReaction.addEmoji', 'Add emoji reaction')}
            aria-expanded={isOpen}
            aria-haspopup="dialog"
            sx={theme => ({
              backgroundColor: isPlacing
                ? theme.palette.primary.light
                : isOpen
                  ? theme.palette.action.selected
                  : 'transparent',
              color: isPlacing ? theme.palette.primary.contrastText : 'inherit',
              '&:hover': {
                backgroundColor: isPlacing
                  ? theme.palette.primary.main
                  : theme.palette.action.hover,
              },
            })}
          >
            {isPlacing && selectedEmoji ? (
              <Typography component="span" sx={{ fontSize: '1.25rem' }}>
                {selectedEmoji}
              </Typography>
            ) : (
              <AddReactionOutlinedIcon />
            )}
          </IconButton>
        </span>
      </Tooltip>

      <Popover
        open={isOpen}
        anchorEl={buttonRef.current}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              borderRadius: 2,
              minWidth: 220,
            },
          },
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 1.5,
              py: 1,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              {t('whiteboard.emojiReaction.title', 'Add Emoji')}
            </Typography>
            <IconButton
              size="small"
              onClick={handleClose}
              aria-label={t('common.close', 'Close')}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <EmojiReactionGrid
            config={config}
            onSelect={handleEmojiSelect}
            selectedEmoji={selectedEmoji}
          />

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', px: 1.5, pb: 1 }}
          >
            {t('whiteboard.emojiReaction.hint', 'Select an emoji, then click on the canvas')}
          </Typography>
        </Box>
      </Popover>
    </Box>
  );
};

export default WhiteboardEmojiReactionPicker;

// Export the hook for external state management if needed
export { useEmojiReactionPickerState };
