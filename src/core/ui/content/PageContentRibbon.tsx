import type { ReactNode } from 'react';
import { gutters } from '../grid/utils';
import { Caption } from '../typography';

type PageContentRibbonProps = {
  sx?: any;
  children?: ReactNode;
  [key: string]: any;
};

const PageContentRibbon = ({ sx, children, ...props }: PageContentRibbonProps) => (
  <Caption
    sx={{ color: 'background.paper', backgroundColor: 'primary.main', ...sx }}
    display="flex"
    gap={gutters(0.5)}
    alignItems="center"
    justifyContent="center"
    padding={0.5}
    {...props}
  >
    <Caption>{children}</Caption>
  </Caption>
);

export default PageContentRibbon;
