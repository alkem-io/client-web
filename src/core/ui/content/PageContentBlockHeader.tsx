import { Box } from '@mui/material';
import { BlockTitle } from '../typography';
import { ReactNode } from 'react';
import { GUTTER_PX } from '../grid/constants';

export interface PageContentBlockHeaderProps {
  title: ReactNode;
  actions?: ReactNode;
  disclaimer?: ReactNode;
}

const PageContentBlockHeader = ({ title, actions, disclaimer }: PageContentBlockHeaderProps) => {
  return (
    <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center" height={GUTTER_PX}>
      <BlockTitle>{title}</BlockTitle>
      {disclaimer && <BlockTitle>{disclaimer}</BlockTitle>}
      {actions && <Box>{actions}</Box>}
    </Box>
  );
};

export default PageContentBlockHeader;
