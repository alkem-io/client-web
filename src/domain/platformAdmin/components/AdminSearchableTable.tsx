import {
  FormControl,
  IconButton,
  InputLabel,
  OutlinedInput,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import RemoveModal from '@/core/ui/dialogs/RemoveModal';
import useLazyLoading from '@/domain/shared/pagination/useLazyLoading';
import LoadingListItem from '@/domain/shared/components/SearchableList/LoadingListItem';
import { times } from 'lodash';
import { Actions } from '@/core/ui/actions/Actions';
import PageContent from '@/core/ui/content/PageContent';
import { BlockTitle, CardTitle } from '@/core/ui/typography';
import RouterLink from '@/core/ui/link/RouterLink';

export interface AdminTableColumn<Item extends AdminSearchableTableItem = AdminSearchableTableItem> {
  header: string;
  flex?: number;
  minWidth?: string;
  render: (item: Item) => ReactNode;
}

export interface AdminSearchableTableItem {
  id: string;
  value: string;
  url: string; // link target for the Name column
  // Additional properties for custom columns should be declared in the extending item interface
}

export interface AdminSearchableTableProps<Item extends AdminSearchableTableItem> {
  data?: Item[]; // optional, defaults to empty array
  columns: AdminTableColumn<Item>[];
  onDelete?: (item: Item) => void;
  loading: boolean;
  fetchMore?: () => Promise<void>; // now optional to enable client-side mode
  pageSize: number;
  firstPageSize?: number;
  searchTerm: string;
  onSearchTermChange: (searchTerm: string) => void;
  totalCount?: number;
  hasMore?: boolean; // optional for client-side mode
  itemActions?: (item: Item) => ReactNode;
  clientSide?: boolean; // when true, component performs lazy loading over provided full dataset
}

export interface SearchableListItem {
  id: string;
  accountId?: string;
  value: string;
  url: string;
  verified?: boolean;
  activeLicensePlanIds?: string[];
  avatar?: {
    uri: string;
  };
}

/**
 * Enhanced table component for admin pages with support for custom columns
 * Maintains the table structure with headers while allowing flexible column configuration
 * Handles pagination internally via useLazyLoading
 */
const AdminSearchableTable = <Item extends AdminSearchableTableItem>({
  data = [],
  columns,
  onDelete,
  loading,
  fetchMore,
  pageSize,
  firstPageSize = pageSize,
  searchTerm,
  onSearchTermChange,
  totalCount,
  hasMore = false,
  itemActions,
  clientSide = false,
}: AdminSearchableTableProps<Item>) => {
  const { t } = useTranslation();
  const [isModalOpened, setModalOpened] = useState<boolean>(false);
  const [itemToRemove, setItemToRemove] = useState<AdminSearchableTableItem | null>(null);
  // client-side lazy loading state
  const [displayedCount, setDisplayedCount] = useState(firstPageSize);

  // Reset displayed items when data changes or search term changes (client-side mode only)
  useEffect(() => {
    if (clientSide) {
      setDisplayedCount(firstPageSize);
    }
  }, [clientSide, firstPageSize, searchTerm, data]);

  const effectiveData = clientSide ? data.slice(0, displayedCount) : data;
  const internalHasMore = clientSide ? displayedCount < data.length : !!hasMore && !!fetchMore;
  const internalFetchMore = clientSide
    ? async () => {
        setDisplayedCount(prev => Math.min(prev + pageSize, data.length));
      }
    : fetchMore || (async () => {});

  const Loader = useMemo(
    () =>
      ({ ref }) => (
        <>
          <LoadingListItem ref={ref} />
          {times(pageSize - 1, i => (
            <LoadingListItem key={`__loading_${i}`} />
          ))}
        </>
      ),
    [pageSize]
  );

  const loader = useLazyLoading(Loader, {
    hasMore: internalHasMore,
    loading,
    fetchMore: internalFetchMore,
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearchTermChange(value);
  };

  const handleRemoveItem = async () => {
    if (onDelete && itemToRemove) {
      onDelete(itemToRemove as Item);
      closeModal();
    }
  };

  const openModal = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, item: AdminSearchableTableItem): void => {
    e.preventDefault();
    setModalOpened(true);
    setItemToRemove(item);
  };

  const closeModal = (): void => {
    setModalOpened(false);
    setItemToRemove(null);
  };

  const renderItemActions = typeof itemActions === 'function' ? itemActions : () => itemActions;

  return (
    <PageContent>
      <FormControl fullWidth size="small">
        <OutlinedInput
          value={searchTerm}
          placeholder={t('components.searchableList.placeholder')}
          onChange={handleSearch}
          sx={{ background: theme => theme.palette.primary.contrastText }}
        />
      </FormControl>
      {typeof totalCount === 'undefined' ? null : (
        <InputLabel>
          {' '}
          {t('components.searchableList.info', { count: effectiveData.length, total: totalCount })}
        </InputLabel>
      )}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow
              sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'flex-end',
                background: theme => theme.palette.primary.main,
              }}
            >
              {/* Name column header */}
              <TableCell component="th" scope="col" sx={{ flex: 2 }}>
                <CardTitle color="primary.contrastText">Name</CardTitle>
              </TableCell>

              {/* Custom column headers */}
              {columns.map((column, index) => (
                <TableCell
                  key={index}
                  component="th"
                  scope="col"
                  sx={{ flex: column.flex || 1, minWidth: column.minWidth || '100px' }}
                >
                  <CardTitle color="primary.contrastText">{column.header}</CardTitle>
                </TableCell>
              ))}

              {/* Actions column header */}
              <TableCell component="th" scope="col" sx={{ minWidth: '100px' }}>
                <CardTitle color="primary.contrastText">Actions</CardTitle>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && !effectiveData
              ? times(firstPageSize, i => <LoadingListItem key={`__loading_${i}`} />)
              : effectiveData.map((item, index) => (
                  <TableRow
                    key={item.id}
                    sx={{
                      backgroundColor: index % 2 === 0 ? 'inherit' : 'action.hover',
                      '&:last-child td, &:last-child th': { border: 0 },
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {/* Name column */}
                    <TableCell component="th" scope="row" sx={{ paddingY: 1, flex: 2 }}>
                      <BlockTitle component={RouterLink} to={item.url}>
                        {item.value}
                      </BlockTitle>
                    </TableCell>

                    {/* Custom columns */}
                    {columns.map((column, colIndex) => (
                      <TableCell
                        key={colIndex}
                        component="td"
                        sx={{
                          paddingY: 1,
                          flex: column.flex || 1,
                          minWidth: column.minWidth || '100px',
                        }}
                      >
                        {column.render(item)}
                      </TableCell>
                    ))}

                    {/* Actions column */}
                    <TableCell component="td" sx={{ paddingY: 1, minWidth: '100px' }}>
                      <Actions>
                        {renderItemActions(item)}
                        {onDelete && (
                          <IconButton onClick={e => openModal(e, item)} size="large" aria-label={t('buttons.delete')}>
                            <DeleteOutline color="error" />
                          </IconButton>
                        )}
                      </Actions>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </TableContainer>
      {loader}
      <RemoveModal
        show={isModalOpened}
        onCancel={closeModal}
        onConfirm={handleRemoveItem}
        text={`Are you sure you want to remove: ${itemToRemove?.value}`}
      />
    </PageContent>
  );
};

export default AdminSearchableTable;
