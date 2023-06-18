import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Collapse } from '@mui/material';
import { ReactNode, forwardRef, useState } from 'react';
import PageContentBlock, { PageContentBlockProps } from './PageContentBlock';

interface PageContentBlockCollapsibleProps extends PageContentBlockProps {
  header: ReactNode;
  children: ReactNode;
}

const PageContentBlockCollapsible = forwardRef<HTMLDivElement, PageContentBlockCollapsibleProps>(
  ({ header, children, ...props }, ref) => {
    const [isCollapsed, setIsCollapsed] = useState(true);

    return (
      <PageContentBlock ref={ref} {...props} disableGap={isCollapsed ? true : props.disableGap}>
        <Box
          display="flex"
          justifyContent="space-between"
          sx={{ cursor: 'pointer' }}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {header}
          {isCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
        </Box>
        <Collapse in={!isCollapsed}>{children}</Collapse>
      </PageContentBlock>
    );
  }
);

export default PageContentBlockCollapsible;
