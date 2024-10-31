import { ReactNode, ReactElement, PropsWithChildren } from 'react';

import { BoxTypeMap } from '@mui/system';
import { Box, BoxProps, SvgIconProps } from '@mui/material';

import { CaptionSmall } from '../typography';
import { Actions } from '../actions/Actions';
import SkipLink from '../keyboardNavigation/SkipLink';
import BlockTitleWithIcon from './BlockTitleWithIcon';

import { gutters } from '../grid/utils';
import { useNextBlockAnchor } from '../keyboardNavigation/NextBlockAnchor';

const PageContentBlockHeader = <D extends React.ElementType = BoxTypeMap['defaultComponent'], P = {}>({
  children,
  icon,
  title,
  actions,
  fullWidth,
  disclaimer,
  ...rest
}: PropsWithChildren<PageContentBlockHeaderProps> & Omit<BoxProps<D, P>, 'title'>) => {
  const nextBlock = useNextBlockAnchor();

  return (
    <Box
      display="flex"
      gap={gutters(0.5)}
      flexDirection="row"
      alignItems="center"
      position="relative"
      width={fullWidth ? '100%' : undefined}
      {...rest}
    >
      <SkipLink anchor={nextBlock} sx={{ position: 'absolute', right: 0, top: 0 }} />

      <Box
        flexGrow={1}
        minWidth={0}
        display="flex"
        flexWrap="wrap"
        flexDirection="row"
        rowGap={gutters(0.5)}
        justifyContent="space-between"
      >
        <BlockTitleWithIcon title={title} icon={icon} />

        {disclaimer && <CaptionSmall>{disclaimer}</CaptionSmall>}

        {children}
      </Box>

      {actions && <Actions height={gutters()}>{actions}</Actions>}
    </Box>
  );
};

export default PageContentBlockHeader;

export interface PageContentBlockHeaderProps {
  title: ReactNode;

  actions?: ReactNode;
  fullWidth?: boolean;
  disclaimer?: ReactNode;
  icon?: ReactElement<SvgIconProps>;
}
