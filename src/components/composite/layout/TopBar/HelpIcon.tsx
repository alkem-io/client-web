import { Link } from 'react-router-dom';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const HelpIcon = () => {
  return (
    <Link to="/help">
      <HelpOutlineIcon color="primary" />
    </Link>
  );
};
export default HelpIcon;
