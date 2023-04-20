import { Box } from '@mui/material';
import { BlockTitle, CaptionSmall } from '../typography';
import { PropsWithChildren, ReactNode } from 'react';
import { Actions } from '../actions/Actions';
import { gutters } from '../grid/utils';

export interface PageContentBlockHeaderProps {
  title: ReactNode;
  actions?: ReactNode;
  disclaimer?: ReactNode;
}

const PageContentBlockHeader = ({
  title,
  actions,
  disclaimer,
  children,
}: PropsWithChildren<PageContentBlockHeaderProps>) => {
  return (
    <Box display="flex" flexDirection="row" alignItems="start">
      <Box
        flexGrow={1}
        minWidth={0}
        display="flex"
        flexDirection="row"
        rowGap={gutters(0.5)}
        justifyContent="space-between"
        flexWrap="wrap"
      >
        <BlockTitle>{title}</BlockTitle>
        {disclaimer && <CaptionSmall>{disclaimer}</CaptionSmall>}
        {children}
      </Box>
      {actions && <Actions height={gutters()}>{actions}</Actions>}
    </Box>
  );
};

export default PageContentBlockHeader;
