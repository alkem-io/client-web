import { Box, BoxProps, SvgIconProps, TypographyProps } from '@mui/material';
import { CaptionSmall } from '../typography';
import { PropsWithChildren, ReactElement, ReactNode } from 'react';
import { Actions } from '../actions/Actions';
import { gutters } from '../grid/utils';
import SkipLink from '../keyboardNavigation/SkipLink';
import { useNextBlockAnchor } from '../keyboardNavigation/NextBlockAnchor';
import BlockTitleWithIcon from './BlockTitleWithIcon';
import { BoxTypeMap } from '@mui/system';

export interface PageContentBlockHeaderProps {
  title: ReactNode;
  titleId?: string;
  icon?: ReactElement<SvgIconProps>;
  actions?: ReactNode;
  disclaimer?: ReactNode;
  fullWidth?: boolean;
  variant?: TypographyProps['variant'];
}

const PageContentBlockHeader = <D extends React.ElementType = BoxTypeMap['defaultComponent'], P = {}>({
  title,
  titleId,
  icon,
  actions,
  variant,
  disclaimer,
  fullWidth,
  children,
  ...props
}: PropsWithChildren<PageContentBlockHeaderProps> & Omit<BoxProps<D, P>, 'title'>) => {
  const nextBlock = useNextBlockAnchor();

  return (
    <Box
      display="flex"
      flexDirection="row"
      alignItems="center"
      gap={gutters(0.5)}
      position="relative"
      width={fullWidth ? '100%' : undefined}
      {...props}
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
        <BlockTitleWithIcon title={title} titleId={titleId} icon={icon} variant={variant} />
        {disclaimer && <CaptionSmall>{disclaimer}</CaptionSmall>}
        {children}
      </Box>
      {actions && <Actions height={gutters()}>{actions}</Actions>}
    </Box>
  );
};

export default PageContentBlockHeader;
