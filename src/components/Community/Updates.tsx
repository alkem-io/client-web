import React, { FC } from 'react';
import { Message } from '../../types/graphql-schema';

interface UpdatesProps {
  messages: Message[];
}

export const Updates: FC<UpdatesProps> = ({ messages: _messages }) => {
  return <div>Updates</div>;
};
export default Updates;
