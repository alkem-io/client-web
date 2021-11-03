import { Box } from '@material-ui/core';
import React, { FC } from 'react';
import Typography from '../../components/core/Typography';
import { createStyles } from '../../hooks/useTheme';
import { Message } from '../../models/graphql-schema';

const useDiscussionsStyles = createStyles(_theme => ({
  container: {
    maxHeight: '480px',
    overflow: 'auto',
    paddingRight: '15px',
  },
}));
interface DiscussionsProps {
  messages?: Message[];
}

export const DiscussionsView: FC<DiscussionsProps> = ({ messages }) => {
  const styles = useDiscussionsStyles();

  let messagesComponent = <Typography> No discussions</Typography>;

  if (messages) {
    messagesComponent = (
      <>
        {messages.map((m, i) => (
          <Box key={i} marginBottom={5}>
            <Typography>{m.message}</Typography>
            <Box textAlign={'right'}>
              <Typography color={'neutralMedium'} variant="caption">{`${m.sender} - ${new Date(
                m.timestamp
              ).toLocaleString()}`}</Typography>
            </Box>
          </Box>
        ))}
      </>
    );
  }

  return <div className={styles.container}>{messagesComponent}</div>;
};
export default DiscussionsView;
