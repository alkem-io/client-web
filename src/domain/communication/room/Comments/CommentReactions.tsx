import { Identifiable } from '../../../shared/types/Identifiable';
import { compact, groupBy, sortBy } from 'lodash';
import React, { useMemo, useRef, useState } from 'react';
import ReactionView, { ReactionViewProps, ReactionViewReaction } from './ReactionView';
import { useUserContext } from '../../../community/contributor/user';
import { Box, IconButton } from '@mui/material';
import { AddReactionOutlined } from '@mui/icons-material';
import { CardText } from '../../../../core/ui/typography/components';
import EmojiSelector from '../../../../core/ui/forms/emoji/EmojiSelector';

interface CommentReactionsReaction extends Identifiable {
  emoji: string;
  sender?: Identifiable & {
    firstName: string;
    lastName: string;
  };
}

interface CommentReactionsProps {
  reactions: CommentReactionsReaction[];
  canAddReaction: boolean;
  onAddReaction?: (emoji: string) => void;
  onRemoveReaction?: ReactionViewProps['onRemoveReaction'];
}

const CommentReactions = ({
  reactions,
  canAddReaction = true,
  onAddReaction,
  onRemoveReaction,
}: CommentReactionsProps) => {
  const { user } = useUserContext();
  const userId = user?.user.id;

  const reactionsWithCount = useMemo<ReactionViewReaction[]>(() => {
    const sortedReactions = sortBy(reactions, r => r.emoji);

    return Object.entries(groupBy(sortedReactions, r => r.emoji)).map(([emoji, reactions]) => {
      return {
        emoji,
        count: reactions.length,
        senders: compact(reactions.map(r => r.sender)),
        ownReactionId: userId && reactions.find(reaction => reaction.sender?.id === userId)?.id,
      };
    });
  }, [reactions, userId]);

  const [isReactionDialogOpen, setIsReactionDialogOpen] = useState(false);

  const addEmojiButtonRef = useRef<HTMLButtonElement>(null);

  const handleEmojiClick = (emoji: string) => {
    setIsReactionDialogOpen(false);
    const isReactionUsedByUser = reactions.find(r => r.emoji === emoji && r.sender?.id === userId);
    if (!isReactionUsedByUser) onAddReaction?.(emoji);
  };

  return (
    <>
      <Box display="flex" gap={0.5} alignItems="center">
        {reactionsWithCount.map(reaction => (
          <ReactionView key={reaction.emoji} reaction={reaction} onRemoveReaction={onRemoveReaction} />
        ))}
      </Box>
      <CardText>
        <IconButton
          ref={addEmojiButtonRef}
          size="small"
          disabled={!canAddReaction}
          onClick={() => setIsReactionDialogOpen(true)}
        >
          <AddReactionOutlined fontSize="inherit" />
        </IconButton>
      </CardText>
      <EmojiSelector
        anchorElement={addEmojiButtonRef.current}
        open={isReactionDialogOpen}
        onClose={() => setIsReactionDialogOpen(false)}
        onEmojiClick={handleEmojiClick}
      />
    </>
  );
};

export default CommentReactions;
