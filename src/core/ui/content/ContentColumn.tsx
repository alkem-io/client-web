import PageContentColumn from './PageContentColumn';
import { BoxProps } from '@mui/material';

// GRID COLUMNS - INFO_COLUMNS => 12 - 3
const CONTENT_COLUMNS = 9;

const ContentColumn = ({
  ref,
  children,
  ...props
}: BoxProps & {
  ref?: React.Ref<HTMLDivElement>;
}) => (
  <PageContentColumn columns={CONTENT_COLUMNS} {...props} ref={ref}>
    {children}
  </PageContentColumn>
);

export default ContentColumn;
