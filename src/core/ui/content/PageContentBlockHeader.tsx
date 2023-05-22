import { Box, SvgIconProps } from '@mui/material';
import { BlockTitle, CaptionSmall } from '../typography';
import { cloneElement, PropsWithChildren, ReactElement, ReactNode } from 'react';
import { Actions } from '../actions/Actions';
import { gutters } from '../grid/utils';

export interface PageContentBlockHeaderProps {
  title: ReactNode;
  icon?: ReactElement<SvgIconProps>;
  actions?: ReactNode;
  disclaimer?: ReactNode;
}

const PageContentBlockHeader = ({
  title,
  icon,
  actions,
  disclaimer,
  children,
}: PropsWithChildren<PageContentBlockHeaderProps>) => {
  return (
    <Box display="flex" flexDirection="row" alignItems="start" gap={gutters(0.5)}>
      <Box
        flexGrow={1}
        minWidth={0}
        display="flex"
        flexDirection="row"
        rowGap={gutters(0.5)}
        justifyContent="space-between"
        flexWrap="wrap"
      >
        <Box display="flex" flexDirection="row" alignItems="start" gap={gutters(0.5)} minWidth={0}>
          {icon && cloneElement(icon, { fontSize: 'small' })}
          <BlockTitle noWrap>{title}</BlockTitle>
        </Box>
        {disclaimer && <CaptionSmall>{disclaimer}</CaptionSmall>}
        {children}
      </Box>
      {actions && <Actions>{actions}</Actions>}
    </Box>
  );
};

export default PageContentBlockHeader;
