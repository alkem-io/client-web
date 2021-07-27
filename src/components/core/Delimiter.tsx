import React, { FC } from 'react';
import { Col } from 'react-bootstrap';
import { createStyles } from '../../hooks/useTheme';

interface DelimiterProps {}

const useDelimiterStyle = createStyles(theme => ({
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
    background: theme.palette.background,
    fontSize: '12px',
    letterSpacing: '1px',
    padding: '0 20px',
    textTransform: 'uppercase',
  },
}));

export const Delimiter: FC<DelimiterProps> = ({ children }) => {
  const style = useDelimiterStyle();

  return (
    <Col className={'p-0'}>
      <div className={style.line}>{children && <strong className={style.strong}>{children}</strong>}</div>
    </Col>
  );
};
export default Delimiter;
