import { Box, BoxProps, SvgIconProps, TypographyProps, useTheme } from '@mui/material';
import { Caption, CaptionSmall } from '../typography';
import { ComponentType, PropsWithChildren, ReactNode } from 'react';
import { Actions } from '../actions/Actions';
import { gutters } from '../grid/utils';
import SkipLink from '../keyboardNavigation/SkipLink';
import { useNextBlockAnchor } from '../keyboardNavigation/NextBlockAnchor';
import BlockTitleWithIcon from './BlockTitleWithIcon';
import { BoxTypeMap } from '@mui/system';
import RoundedIcon from '../icon/RoundedIcon';
import SwapColors from '../palette/SwapColors';

export interface PageContentBlockHeaderCardLikeProps {
  title: ReactNode;
  subtitle?: ReactNode;
  titleId?: string;
  icon?: ComponentType<SvgIconProps>;
  avatar?: ReactNode;
  actions?: ReactNode;
  disclaimer?: ReactNode;
  fullWidth?: boolean;
  selected?: boolean;
  variant?: TypographyProps['variant'];
}

const PageContentBlockHeaderCardLike = <D extends React.ElementType = BoxTypeMap['defaultComponent'], P = {}>({
  title,
  subtitle,
  titleId,
  icon,
  avatar,
  actions,
  variant,
  disclaimer,
  fullWidth,
  selected,
  children,
  ...props
}: PropsWithChildren<PageContentBlockHeaderCardLikeProps> & Omit<BoxProps<D, P>, 'title'>) => {
  const theme = useTheme();
  const nextBlock = useNextBlockAnchor();
  return (
    <SwapColors swap={!!selected}>
      <Box
        marginBottom={0}
        borderBottom={`1px solid ${theme.palette.divider}`}
        paddingX={gutters()}
        paddingY={gutters(0.5)}
        backgroundColor={selected ? theme.palette.primary.dark : 'inherit'}
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
          <BlockTitleWithIcon
            title={title}
            titleId={titleId}
            subtitle={<Caption>{subtitle}</Caption>}
            icon={icon ? <RoundedIcon size="xsmall" component={icon} /> : undefined}
            avatar={avatar}
            variant={variant}
          />
          {disclaimer && <CaptionSmall>{disclaimer}</CaptionSmall>}
          {children}
        </Box>
        {actions && <Actions>{actions}</Actions>}
      </Box>
    </SwapColors>
  );
};

export default PageContentBlockHeaderCardLike;
