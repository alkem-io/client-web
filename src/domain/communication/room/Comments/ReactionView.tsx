import React from 'react';
import { Paper } from '@mui/material';
import { CardText } from '../../../../core/ui/typography/components';

export interface ReactionViewReaction {
  emoji: string;
  count: number;
  own?: boolean;
}

interface ReactionViewProps {
  reaction: ReactionViewReaction;
}

const ReactionView = ({ reaction }: ReactionViewProps) => {
  return (
    <Paper elevation={0}>
      <CardText>
        {reaction.emoji}
        {reaction.count}
      </CardText>
    </Paper>
  );
};

export default ReactionView;
