import { Identifiable } from '../../../shared/types/Identifiable';
import { groupBy } from 'lodash';
import React, { useMemo } from 'react';
import ReactionView, { ReactionViewReaction } from './ReactionView';
import { useUserContext } from '../../../community/contributor/user';
import { IconButton } from '@mui/material';
import { AddReactionOutlined } from '@mui/icons-material';
import { CardText } from '../../../../core/ui/typography/components';

interface CommentReactionsReaction extends Identifiable {
  emoji: string;
  sender?: Identifiable & {
    firstName: string;
    lastName: string;
  };
}

interface CommentReactionsProps {
  reactions: CommentReactionsReaction[];
  onAddReaction?: () => void;
}

const CommentReactions = ({ reactions, onAddReaction }: CommentReactionsProps) => {
  const { user } = useUserContext();

  const reactionsWithCount = useMemo<ReactionViewReaction[]>(
    () =>
      Object.entries(groupBy(reactions, r => r.emoji)).map(([emoji, reactions]) => {
        return {
          emoji,
          count: reactions.length,
          own: reactions.some(r => !!r.sender && r.sender.id === user?.user.id),
        };
      }),
    [reactions]
  );

  return (
    <>
      {reactionsWithCount.map(reaction => (
        <ReactionView reaction={reaction} />
      ))}
      <CardText sx={{ marginLeft: reactionsWithCount.length === 0 ? -1 : 0 }}>
        <IconButton size="small" onClick={onAddReaction}>
          <AddReactionOutlined fontSize="inherit" />
        </IconButton>
      </CardText>
    </>
  );
};

export default CommentReactions;
