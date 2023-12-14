import { styled } from '@mui/styles';
import { Link } from 'react-router-dom';

/**
 * @deprecated
 */
const LinkNoUnderline = styled(Link)({
  textDecoration: 'none',
  color: 'inherit',
});

export default LinkNoUnderline;
