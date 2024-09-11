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
  TableRow,
} from '@mui/material';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import React, { forwardRef, ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import RemoveModal from '../../../../core/ui/dialogs/RemoveModal';
import useLazyLoading from '../../pagination/useLazyLoading';
import LoadingListItem from './LoadingListItem';
import { times } from 'lodash';
import RouterLink from '../../../../core/ui/link/RouterLink';
import { BlockTitle } from '../../../../core/ui/typography';
import { Actions } from '../../../../core/ui/actions/Actions';

export interface SearchableListProps<Item extends SearchableListItem> {
  data: Item[] | undefined;
  active?: number | string;
  onDelete?: (item: Item) => void;
  loading: boolean;
  fetchMore: () => Promise<void>;
  pageSize: number;
  firstPageSize?: number;
  searchTerm: string;
  onSearchTermChange: (searchTerm: string) => void;
  totalCount?: number;
  hasMore: boolean | undefined;
  itemActions?: (item: Item) => ReactNode | ReactNode;
}

export interface SearchableListItem {
  id: string;
  value: string;
  url: string;
  verified?: boolean;
}

const SimpleSearchableList = <Item extends SearchableListItem>({
  data = [],
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
}: SearchableListProps<Item>) => {
  const { t } = useTranslation();
  const [isModalOpened, setModalOpened] = useState<boolean>(false);
  const [itemToRemove, setItemToRemove] = useState<SearchableListItem | null>(null);

  const Loader = useMemo(
    () =>
      forwardRef<HTMLDivElement>((props, ref) => (
        <>
          <LoadingListItem ref={ref} />
          {times(pageSize - 1, i => (
            <LoadingListItem key={`__loading_${i}`} />
          ))}
        </>
      )),
    [pageSize]
  );

  const loader = useLazyLoading(Loader, {
    hasMore,
    loading,
    fetchMore,
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

  const openModal = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, item: SearchableListItem): void => {
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
    <TableContainer component={Paper}>
      <FormControl fullWidth size="small">
        <OutlinedInput
          value={searchTerm}
          placeholder={t('components.searchableList.placeholder')}
          onChange={handleSearch}
          sx={{ background: theme => theme.palette.primary.contrastText }}
        />
      </FormControl>
      {typeof totalCount === 'undefined' ? null : (
        <InputLabel> {t('components.searchableList.info', { count: data.length, total: totalCount })}</InputLabel>
      )}
      <Table sx={{ minWidth: 700 }} aria-label="customized table">
        <TableBody>
          {loading && !data
            ? times(firstPageSize, i => <LoadingListItem key={`__loading_${i}`} />)
            : data.map((item, index) => (
                <TableRow
                  key={item.id}
                  sx={{
                    backgroundColor: index % 2 === 0 ? 'inherit' : 'action.hover',
                    '&:last-child td, &:last-child th': { border: 0 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <TableCell component="th" scope="row" sx={{ paddingY: 0 }}>
                    <BlockTitle component={RouterLink} to={item.url}>
                      {item.value}
                    </BlockTitle>
                  </TableCell>
                  <TableCell component="th" scope="row" sx={{ paddingY: 0 }}>
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
      {loader}
      <RemoveModal
        show={isModalOpened}
        onCancel={closeModal}
        onConfirm={handleRemoveItem}
        text={`Are you sure you want to remove: ${itemToRemove?.value}`}
      />
    </TableContainer>
  );
};

export default SimpleSearchableList;
