import { Box } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

const CardExpandButton = ({ expanded }: { expanded: boolean }) => (
  <Box display="flex" marginRight={-0.5} alignItems="end">
    {expanded ? <ExpandLess /> : <ExpandMore />}
  </Box>
);

export default CardExpandButton;
