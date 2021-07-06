import React, { FC } from 'react';
import { createStyles } from '../../hooks/useTheme';
import { Message } from '../../types/graphql-schema';
import Typography from '../core/Typography';

const useUpdatesStyles = createStyles(_theme => ({
  container: {
    maxHeight: '480px',
    overflow: 'auto',
    paddingRight: '15px',
  },
}));
interface UpdatesProps {
  messages: Message[];
}

export const Updates: FC<UpdatesProps> = ({ messages }) => {
  const styles = useUpdatesStyles();
  return (
    <div className={styles.container}>
      {messages.map((m, i) => (
        <div key={i} className={'mb-5'}>
          <Typography className={'text-right'} color={'neutralMedium'} variant="caption">{`${m.sender} - ${new Date(
            m.timestamp
          ).toLocaleString()}`}</Typography>
          <div style={{ display: 'flex' }}>
            <span>{m.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
export default Updates;
