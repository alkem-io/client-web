import { Box, SvgIconProps, Theme, useMediaQuery } from '@mui/material';
import { CaptionSmall } from '../typography';
import { PropsWithChildren, ReactElement, ReactNode } from 'react';
import { Actions } from '../actions/Actions';
import { gutters } from '../grid/utils';
import SkipLink from '../keyboardNavigation/SkipLink';
import { useNextBlockAnchor } from '../keyboardNavigation/NextBlockAnchor';
import BlockTitleWithIcon from './BlockTitleWithIcon';

export interface PageContentBlockHeaderProps {
  title: ReactNode;
  icon?: ReactElement<SvgIconProps>;
  actions?: ReactNode;
  dialogAction?: ReactNode;
  disclaimer?: ReactNode;
  fullWidth?: boolean;
}

const PageContentBlockHeader = ({
  title,
  icon,
  actions,
  dialogAction,
  disclaimer,
  fullWidth,
  children,
}: PropsWithChildren<PageContentBlockHeaderProps>) => {
  const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'));
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  const nextBlock = useNextBlockAnchor();

  return (
    <>
      <Box
        display="flex"
        flexDirection="row"
        alignItems={isSmallScreen ? 'start' : 'center'}
        gap={gutters(0.5)}
        position="relative"
        width={fullWidth ? '100%' : undefined}
      >
        <SkipLink anchor={nextBlock} sx={{ position: 'absolute', right: 0, top: 0 }} />
        <Box
          flexGrow={1}
          minWidth={0}
          display="flex"
          flexDirection="row"
          rowGap={gutters(0.5)}
          justifyContent="space-between"
          flexWrap="wrap"
        >
          <BlockTitleWithIcon title={title} icon={icon} />
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
