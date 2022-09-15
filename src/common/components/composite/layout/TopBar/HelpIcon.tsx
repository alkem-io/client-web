import { Link } from 'react-router-dom';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { Box } from '@mui/material';

const HelpIcon = () => {
  return (
    <Box display={'flex'} alignItems={'center'}>
      <Link to="/help">
        <HelpOutlineIcon color="primary" />
      </Link>
    </Box>
  );
};
export default HelpIcon;
