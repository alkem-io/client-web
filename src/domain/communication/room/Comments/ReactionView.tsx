import React from 'react';
import { Chip, Paper, Tooltip } from '@mui/material';
import { Caption, CardText, Text } from '@/core/ui/typography/components';
import Gutters from '@/core/ui/grid/Gutters';

interface ReactionViewReactionSender {
  profile: {
    displayName: string;
  };
}

export interface ReactionViewReaction {
  emoji: string;
  count: number;
  ownReactionId?: string;
  senders: ReactionViewReactionSender[];
}

export interface ReactionViewProps {
  reaction: ReactionViewReaction;
  onRemoveReaction?: (reactionId: string) => void;
}

const SENDERS_JOIN_SEPARATOR = ', ';

const ReactionView = ({ reaction, onRemoveReaction }: ReactionViewProps) => {
  const handleRemoveReaction = () => reaction.ownReactionId && onRemoveReaction?.(reaction.ownReactionId);

  return (
    <Tooltip
      title={
        <Paper variant="outlined">
          <Gutters row>
            <Text>{reaction.emoji}</Text>
            <Caption>{reaction.senders.map(({ profile }) => profile.displayName).join(SENDERS_JOIN_SEPARATOR)}</Caption>
          </Gutters>
        </Paper>
      }
      componentsProps={{ tooltip: { sx: { backgroundColor: 'transparent' } } }}
    >
      <Chip
        variant={reaction.ownReactionId ? 'outlined' : 'filled'}
        color={reaction.ownReactionId ? 'primary' : undefined}
        clickable={!!reaction.ownReactionId}
        onClick={handleRemoveReaction}
        sx={{ height: theme => theme.spacing(1.5), borderRadius: theme => theme.spacing(1.2) }}
        label={<CardText>{`${reaction.emoji} ${reaction.count}`}</CardText>}
      />
    </Tooltip>
  );
};

export default ReactionView;
