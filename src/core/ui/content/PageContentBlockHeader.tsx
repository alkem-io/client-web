import { Box, BoxProps, SvgIconProps, TypographyProps } from '@mui/material';
import { CaptionSmall } from '../typography';
import { PropsWithChildren, ReactElement, ReactNode, useEffect, useRef, useState } from 'react';
import { Actions } from '../actions/Actions';
import { gutters } from '../grid/utils';
import SkipLink from '../keyboardNavigation/SkipLink';
import { useNextBlockAnchor } from '../keyboardNavigation/NextBlockAnchor';
import BlockTitleWithIcon from './BlockTitleWithIcon';
import { BoxTypeMap } from '@mui/system';
import { useResizeDetector } from 'react-resize-detector';

export interface PageContentBlockHeaderProps {
  title: ReactNode;
  titleId?: string;
  icon?: ReactElement<SvgIconProps>;
  actions?: ReactNode;
  autoCollapseActions?: boolean;
  disclaimer?: ReactNode;
  fullWidth?: boolean;
  variant?: TypographyProps['variant'];
}

const PageContentBlockHeader = <D extends React.ElementType = BoxTypeMap['defaultComponent'], P = {}>({
  title,
  titleId,
  icon,
  actions,
  autoCollapseActions = false,
  variant,
  disclaimer,
  fullWidth,
  children,
  ...props
}: PropsWithChildren<PageContentBlockHeaderProps> & Omit<BoxProps<D, P>, 'title'>) => {
  const nextBlock = useNextBlockAnchor();

  const { ref: actionsContainerRef, width } = useResizeDetector();
  const actionsRef = useRef<HTMLDivElement>(null);

  const [actionsCollapsed, setActionsCollapsed] = useState(false);
  const actionsContent = actions ? (
    <Actions ref={actionsRef} height={!actionsCollapsed ? gutters() : undefined} width="fit-content">
      {actions}
    </Actions>
  ) : null;

  useEffect(() => {
    if (!actionsRef.current || !actionsContainerRef.current || !autoCollapseActions || !actions || !actionsContent) {
      return;
    }
    if (actionsRef.current.clientWidth + 20 > actionsContainerRef.current.clientWidth) {
      setActionsCollapsed(true);
    } else {
      setActionsCollapsed(false);
    }
  }, [width]);

  return (
    <>
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
        <Box ref={actionsContainerRef} width="100%" display="flex" justifyContent="flex-end">
          {actions && autoCollapseActions && !actionsCollapsed && actionsContent}
        </Box>
      </Box>
      {actions && autoCollapseActions && actionsCollapsed && <Box>{actionsContent}</Box>}
    </>
  );
};

export default PageContentBlockHeader;
