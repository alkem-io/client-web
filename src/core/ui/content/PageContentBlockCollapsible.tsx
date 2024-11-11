import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Collapse, BoxProps } from '@mui/material';
import { ReactNode, forwardRef, useState } from 'react';
import PageContentBlock, { PageContentBlockProps } from './PageContentBlock';
import { gutters } from '../grid/utils';

interface PageContentBlockCollapsibleProps extends PageContentBlockProps {
  header: ReactNode;
  primaryAction?: ReactNode;
  collapseHeaderProps?: BoxProps;
  children: ReactNode;
}

const PageContentBlockCollapsible = forwardRef<HTMLDivElement, PageContentBlockCollapsibleProps>(
  ({ header, primaryAction, children, collapseHeaderProps, ...props }, ref) => {
    const [isCollapsed, setIsCollapsed] = useState(true);

    return (
      <PageContentBlock ref={ref} {...props} disableGap={isCollapsed ? true : props.disableGap}>
        <Box
          display="flex"
          justifyContent="space-between"
          sx={{ cursor: 'pointer' }}
          onClick={() => setIsCollapsed(!isCollapsed)}
          {...collapseHeaderProps}
        >
          {header}
          {primaryAction &&
            (isCollapsed ? undefined : (
              <Box marginLeft="auto" marginRight={gutters(0.5)} onClick={event => event.stopPropagation()}>
                {primaryAction}
              </Box>
            ))}
          {isCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
        </Box>
        <Collapse in={!isCollapsed}>{children}</Collapse>
      </PageContentBlock>
    );
  }
);

export default PageContentBlockCollapsible;
