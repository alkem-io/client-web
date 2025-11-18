import { Chip, Box } from '@mui/material';
import { gutters } from '@/core/ui/grid/utils';

interface SpaceCardTagsOverlayProps {
  tags: string[];
  maxVisibleTags?: number;
  compact?: boolean;
}

const SpaceCardTagsOverlay = ({ tags, maxVisibleTags = 2, compact = false }: SpaceCardTagsOverlayProps) => {
  if (!tags || tags.length === 0) {
    return null;
  }

  const visibleTags = tags.slice(0, maxVisibleTags);
  const remainingCount = tags.length - maxVisibleTags;

  return (
    <Box
      display="flex"
      flexWrap="wrap"
      gap={0.5}
      sx={{
        position: 'absolute',
        bottom: compact ? 60 : gutters(0.5), // Push tags up 60px in compact mode to clear footer
        left: gutters(0.5),
        right: gutters(0.5),
        zIndex: compact ? 2 : 'auto', // Ensure tags appear above gradient but below footer
      }}
    >
      {visibleTags.map((tag, index) => (
        <Chip
          key={index}
          label={tag}
          size="small"
          color="primary"
          sx={{
            fontWeight: 500,
            fontSize: '0.75rem',
            height: '24px',
            maxWidth: '120px',
            '& .MuiChip-label': {
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            },
          }}
        />
      ))}
      {remainingCount > 0 && (
        <Chip
          label={`+${remainingCount}`}
          size="small"
          sx={{
            backgroundColor: 'grey.300',
            color: 'text.primary',
            fontWeight: 500,
            fontSize: '0.75rem',
            height: '24px',
          }}
        />
      )}
    </Box>
  );
};

export default SpaceCardTagsOverlay;
