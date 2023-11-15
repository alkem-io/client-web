import { Box, SvgIconProps, Theme, useMediaQuery } from '@mui/material';
import { BlockTitle, CaptionSmall } from '../typography';
import { cloneElement, PropsWithChildren, ReactElement, ReactNode } from 'react';
import { Actions } from '../actions/Actions';
import { gutters } from '../grid/utils';
import SkipLink from '../keyboardNavigation/SkipLink';
import { useNextBlockAnchor } from '../keyboardNavigation/NextBlockAnchor';

export interface PageContentBlockHeaderProps {
  title: ReactNode;
  icon?: ReactElement<SvgIconProps>;
  actions?: ReactNode;
  dialogAction?: ReactNode;
  disclaimer?: ReactNode;
}

const PageContentBlockHeader = ({
  title,
  icon,
  actions,
  dialogAction,
  disclaimer,
  children,
}: PropsWithChildren<PageContentBlockHeaderProps>) => {
  const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'));
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  const nextBlockAnchor = useNextBlockAnchor();

  return (
    <>
      <Box
        display="flex"
        flexDirection="row"
        alignItems={isSmallScreen ? 'start' : 'center'}
        gap={gutters(0.5)}
        position="relative"
      >
        <SkipLink anchor={nextBlockAnchor} sx={{ position: 'absolute', right: 0, top: 0 }} />
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
        {!isMobile && (
          // In desktop the expand button and the actions go in the same row
          <Actions>
            {actions}
            {dialogAction}
          </Actions>
        )}
        {isMobile && <Actions>{dialogAction}</Actions>}
      </Box>
      {isMobile && (
        <Actions marginTop={gutters(-0.5)} flexDirection="row">
          {actions}
        </Actions>
      )}
    </>
  );
};

export default PageContentBlockHeader;
