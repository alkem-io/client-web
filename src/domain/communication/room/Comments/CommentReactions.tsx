import { Identifiable } from '@/core/utils/Identifiable';
import { compact, groupBy, sortBy } from 'lodash';
import { useMemo, useRef, useState } from 'react';
import ReactionView, { ReactionViewProps, ReactionViewReaction } from './ReactionView';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { Box, IconButton, Popover } from '@mui/material';
import { AddReactionOutlined } from '@mui/icons-material';
import { Caption, CardText } from '@/core/ui/typography/components';
import EmojiSelector from '@/core/ui/forms/emoji/EmojiSelector';
import { useTranslation } from 'react-i18next';
import { gutters } from '@/core/ui/grid/utils';
import useReactionsOverflow from './useReactionsOverflow';

interface CommentReactionsReaction extends Identifiable {
  emoji: string;
  timestamp: number;
  sender?: Identifiable & { profile: { displayName: string } };
}

interface CommentReactionsProps {
  reactions: CommentReactionsReaction[];
  canAddReaction: boolean;
  onAddReaction?: (emoji: string) => void;
  onRemoveReaction?: ReactionViewProps['onRemoveReaction'];
  showAddButton?: boolean;
  onPickerVisibilityChange?: (isOpen: boolean) => void;
}

const CommentReactions = ({
  reactions,
  canAddReaction = true,
  onAddReaction,
  onRemoveReaction,
  showAddButton = true,
  onPickerVisibilityChange,
}: CommentReactionsProps) => {
  const { userModel } = useCurrentUserContext();
  const userId = userModel?.id;
  const { t } = useTranslation();

  const reactionsWithCount = useMemo<ReactionViewReaction[]>(() => {
    // Group reactions by emoji
    const grouped = groupBy(reactions, r => r.emoji);

    // Map to reaction view format with first timestamp for sorting
    const reactionGroups = Object.entries(grouped).map(([emoji, emojiReactions]) => {
      // Find the earliest timestamp (first reaction of this emoji)
      const firstTimestamp = Math.min(...emojiReactions.map(r => r.timestamp));

      return {
        emoji,
        count: emojiReactions.length,
        firstTimestamp,
        // if the reaction sender is missing (e.g., due to a deleted user), we replace it with a placeholder from translation
        senders: compact(
          emojiReactions.map(
            r => r.sender || { id: 'deleted-user', profile: { displayName: t('messaging.missingAuthor') } }
          )
        ),
        ownReactionId: userId && emojiReactions.find(reaction => reaction.sender?.id === userId)?.id,
      };
    });

    // Sort by first timestamp (chronological order of first reaction per emoji)
    return sortBy(reactionGroups, g => g.firstTimestamp);
  }, [reactions, userId, t]);

  const {
    visibleReactions,
    overflowReactions,
    overflowCount,
    hasOverflow,
    overflowAnchor,
    handleOpenOverflow,
    handleCloseOverflow,
    isOverflowOpen,
  } = useReactionsOverflow({
    reactions: reactionsWithCount,
    getCount: r => r.count,
  });

  const [isReactionDialogOpen, setIsReactionDialogOpen] = useState(false);

  const addEmojiButtonRef = useRef<HTMLButtonElement>(null);

  const handleEmojiClick = (emoji: string) => {
    setIsReactionDialogOpen(false);
    onPickerVisibilityChange?.(false);
    const isReactionUsedByUser = reactions.find(r => r.emoji === emoji && r.sender?.id === userId);
    if (!isReactionUsedByUser) onAddReaction?.(emoji);
  };

  const handleOpenPicker = () => {
    setIsReactionDialogOpen(true);
    onPickerVisibilityChange?.(true);
  };

  const handleClosePicker = () => {
    setIsReactionDialogOpen(false);
    onPickerVisibilityChange?.(false);
  };

  return (
    <>
      <Box display="flex" gap={0.5} alignItems="center">
        {visibleReactions.map(reaction => (
          <ReactionView key={reaction.emoji} reaction={reaction} onRemoveReaction={onRemoveReaction} />
        ))}
        {hasOverflow && (
          <IconButton
            size="small"
            onClick={handleOpenOverflow}
            aria-label={t('buttons.readMore')}
            sx={{ height: gutters(1.5), width: gutters(1.5) }}
          >
            <Caption fontWeight={700}>{`+${overflowCount}`}</Caption>
          </IconButton>
        )}
      </Box>
      {showAddButton && (
        <CardText>
          <IconButton
            ref={addEmojiButtonRef}
            size="small"
            disabled={!canAddReaction}
            onClick={handleOpenPicker}
            aria-label={t('messaging.addReaction')}
          >
            <AddReactionOutlined fontSize="inherit" />
          </IconButton>
        </CardText>
      )}
      <EmojiSelector
        anchorElement={addEmojiButtonRef.current}
        open={isReactionDialogOpen}
        onClose={handleClosePicker}
        onEmojiClick={handleEmojiClick}
      />
      <Popover
        open={isOverflowOpen}
        anchorEl={overflowAnchor}
        onClose={handleCloseOverflow}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Box padding={gutters(0.75)} minWidth={200} display="flex" flexDirection="column" gap={gutters(0.5)}>
          {overflowReactions.map(reaction => {
            const senderNames = reaction.senders.map(s => s.profile.displayName).join(', ');
            return (
              <Box key={reaction.emoji} display="flex" alignItems="center" gap={gutters(0.5)}>
                <ReactionView reaction={reaction} onRemoveReaction={onRemoveReaction} />
                <Caption color="text.secondary">{senderNames}</Caption>
              </Box>
            );
          })}
        </Box>
      </Popover>
    </>
  );
};

export default CommentReactions;
