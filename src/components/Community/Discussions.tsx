import React, { FC } from 'react';
import { createStyles } from '../../hooks/useTheme';
import { CommunicationMessageResult } from '../../types/graphql-schema';
import Typography from '../core/Typography';

const useDiscussionsStyles = createStyles(_theme => ({
  container: {
    maxHeight: '480px',
    overflow: 'auto',
    paddingRight: '15px',
  },
}));
interface DiscussionsProps {
  messages?: CommunicationMessageResult[];
}

export const Discussions: FC<DiscussionsProps> = ({ messages }) => {
  const styles = useDiscussionsStyles();

  let messagesComponent = <Typography> No discussions</Typography>;

  if (messages) {
    messagesComponent = (
      <>
        {messages.map((m, i) => (
          <div key={i} className={'mb-5'}>
            <Typography>{m.message}</Typography>
            <Typography className={'text-right'} color={'neutralMedium'} variant="caption">{`${m.sender} - ${new Date(
              m.timestamp
            ).toLocaleString()}`}</Typography>
          </div>
        ))}
      </>
    );
  }

  return <div className={styles.container}>{messagesComponent}</div>;
};
export default Discussions;
