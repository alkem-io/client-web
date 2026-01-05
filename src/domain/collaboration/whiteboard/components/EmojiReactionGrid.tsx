import { Box, IconButton, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { EmojiReactionConfiguration, EmojiReactionConfigEntry } from '../reactionEmoji/types';

interface EmojiReactionGridProps {
  /** Emoji configuration to display */
  config: EmojiReactionConfiguration;

  /** Callback when an emoji is clicked */
  onSelect: (emoji: string) => void;

  /** Currently selected emoji for highlighting */
  selectedEmoji?: string | null;

  /** Optional className for styling */
  className?: string;
}

/**
 * Grid of emoji buttons for the whiteboard emoji reaction picker.
 *
 * Displays a grid of emoji buttons from the configuration.
 * Each button has an accessible label and visual feedback on hover/selection.
 */
const EmojiReactionGrid = ({
  config,
  onSelect,
  selectedEmoji,
  className,
}: EmojiReactionGridProps) => {
  const { t } = useTranslation();

  const handleEmojiClick = (entry: EmojiReactionConfigEntry) => {
    onSelect(entry.emoji);
  };

  const handleKeyDown = (event: React.KeyboardEvent, entry: EmojiReactionConfigEntry) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(entry.emoji);
    }
  };

  if (config.emojis.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
        {t('whiteboard.emojiReaction.noEmojis', 'No emojis available')}
      </Box>
    );
  }

  return (
    <Box
      className={className}
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 0.5,
        p: 1,
      }}
      role="listbox"
      aria-label={t('whiteboard.emojiReaction.gridLabel', 'Select an emoji')}
    >
      {config.emojis.map(entry => {
        const isSelected = selectedEmoji === entry.emoji;

        return (
          <Tooltip key={entry.emoji} title={entry.label} placement="top" arrow>
            <IconButton
              onClick={() => handleEmojiClick(entry)}
              onKeyDown={event => handleKeyDown(event, entry)}
              aria-label={entry.label}
              aria-selected={isSelected}
              role="option"
              sx={theme => ({
                fontSize: '1.5rem',
                width: 40,
                height: 40,
                borderRadius: 1,
                backgroundColor: isSelected
                  ? theme.palette.action.selected
                  : 'transparent',
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
                '&:focus-visible': {
                  outline: `2px solid ${theme.palette.primary.main}`,
                  outlineOffset: 2,
                },
              })}
            >
              {entry.emoji}
            </IconButton>
          </Tooltip>
        );
      })}
    </Box>
  );
};

export default EmojiReactionGrid;
