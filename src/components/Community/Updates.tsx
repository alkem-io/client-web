import React, { FC } from 'react';
import { createStyles } from '../../hooks';
import { CommunicationMessageResult } from '../../types/graphql-schema';
import Typography from '../core/Typography';

const useUpdatesStyles = createStyles(_theme => ({
  container: {
    maxHeight: '480px',
    overflow: 'auto',
    paddingRight: '15px',
  },
}));
interface UpdatesProps {
  messages?: CommunicationMessageResult[];
}

export const Updates: FC<UpdatesProps> = ({ messages }) => {
  const styles = useUpdatesStyles();

  let messagesComponent = <Typography> No updates</Typography>;

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
export default Updates;
