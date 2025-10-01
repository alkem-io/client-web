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

export interface PageContentBlockHeaderCardLike {
  title: ReactNode;
  subtitle?: ReactNode;
  titleId?: string;
  icon?: ComponentType<SvgIconProps>;
  actions?: ReactNode;
  disclaimer?: ReactNode;
  fullWidth?: boolean;
  variant?: TypographyProps['variant'];
}

const PageContentBlockHeaderCardLike = <D extends React.ElementType = BoxTypeMap['defaultComponent'], P = {}>({
  title,
  subtitle,
  titleId,
  icon,
  actions,
  variant,
  disclaimer,
  fullWidth,
  children,
  ...props
}: PropsWithChildren<PageContentBlockHeaderCardLike> & Omit<BoxProps<D, P>, 'title'>) => {
  const theme = useTheme();
  const nextBlock = useNextBlockAnchor();
  return (
    <Box
      margin={gutters(-1)}
      marginBottom={0}
      borderBottom={`1px solid ${theme.palette.divider}`}
      paddingX={gutters()}
      paddingY={gutters(0.5)}
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
          variant={variant}
        />
        {disclaimer && <CaptionSmall>{disclaimer}</CaptionSmall>}
        {children}
      </Box>
      {actions && (
        <Actions>
          {actions}
        </Actions>
      )}
    </Box>
  );
};

export default PageContentBlockHeaderCardLike;
