import { Box } from '@mui/material';
import React, { FC } from 'react';
import { makeStyles } from '@mui/styles';

interface DelimiterProps {}

const useDelimiterStyle = makeStyles(theme => ({
  line: {
    borderTop: '1px solid',
    borderColor: '#d9dadc',
    display: 'block',
    lineHeight: '1px',
    margin: '15px 0',
    position: 'relative',
    textAlign: 'center',
  },
  strong: {
    background: theme.palette.background.paper,
    fontSize: '12px',
    letterSpacing: '1px',
    padding: '0 20px',
    textTransform: 'uppercase',
  },
}));

export const Delimiter: FC<DelimiterProps> = ({ children }) => {
  const style = useDelimiterStyle();

  return (
    <Box padding={0}>
      <div className={style.line}>{children && <strong className={style.strong}>{children}</strong>}</div>
    </Box>
  );
};
export default Delimiter;
