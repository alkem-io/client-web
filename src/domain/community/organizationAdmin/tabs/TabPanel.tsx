import { ReactNode } from 'react';
import { Box } from '@mui/material';
import Gutters from '@/core/ui/grid/Gutters';

interface TabPanelProps {
  children?: ReactNode;
  dir?: string;
  index: number;
  value: number;
}

export const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <Box role="tabpanel" hidden={value !== index} aria-labelledby={`full-width-tab-${index}`} {...other}>
      {value === index && <Gutters>{children}</Gutters>}
    </Box>
  );
};
