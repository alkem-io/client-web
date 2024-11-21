import PageContentColumnBase from '@/core/ui/content/PageContentColumnBase';
import { getColumnsWidth, gutters } from '@/core/ui/grid/utils';
import { useColumns } from '@/core/ui/grid/GridContext';
import { GRID_COLUMNS_MOBILE } from '@/core/ui/grid/constants';
import { PropsWithChildren } from 'react';

interface InfoColumnProps {
  collapsed: boolean;
}

const INFO_COLUMNS = 3;

const InfoColumn = ({ collapsed, children }: PropsWithChildren<InfoColumnProps>) => {
  const availableColumns = useColumns();

  const isMobile = availableColumns <= GRID_COLUMNS_MOBILE;

  if (isMobile) {
    return null;
  }

  const width = collapsed ? gutters(3) : getColumnsWidth(INFO_COLUMNS, availableColumns);

  return (
    <PageContentColumnBase
      columns={collapsed ? 0 : 3}
      width={isMobile ? 0 : width}
      flexGrow={0}
      flexShrink={0}
      sx={{
        transition: 'width .2s ease-in-out',
        position: 'sticky',
        top: gutters(1),
        maxHeight: '100vh',
        overflowY: 'auto',
      }}
    >
      {children}
    </PageContentColumnBase>
  );
};

export default InfoColumn;
