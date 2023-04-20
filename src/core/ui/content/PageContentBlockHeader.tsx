import { Box } from '@mui/material';
import { BlockTitle, CaptionSmall } from '../typography';
import { ReactNode } from 'react';
import { GUTTER_PX } from '../grid/constants';
import { Actions } from '../actions/Actions';

export interface PageContentBlockHeaderProps {
  title: ReactNode;
  actions?: ReactNode;
  disclaimer?: ReactNode;
}

const PageContentBlockHeader = ({ title, actions, disclaimer }: PageContentBlockHeaderProps) => {
  return (
    <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center" height={GUTTER_PX}>
      <BlockTitle>{title}</BlockTitle>
      {disclaimer && <CaptionSmall>{disclaimer}</CaptionSmall>}
      {actions && <Actions>{actions}</Actions>}
    </Box>
  );
};

export default PageContentBlockHeader;
