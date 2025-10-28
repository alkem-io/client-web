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
import React, { ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import RemoveModal from '@/core/ui/dialogs/RemoveModal';
import useLazyLoading from '@/domain/shared/pagination/useLazyLoading';
import LoadingListItem from './LoadingListItem';
import { times } from 'lodash';
import { Actions } from '@/core/ui/actions/Actions';
import PageContent from '@/core/ui/content/PageContent';
import ContributorCardHorizontal from '@/core/ui/card/ContributorCardHorizontal';
import { BlockTitle, CardTitle } from '@/core/ui/typography';
import RouterLink from '@/core/ui/link/RouterLink';

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
  itemActions?: (item: Item) => ReactNode;
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
 * @deprecated - use AdminSearchableTable instead
 */
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
        <InputLabel> {t('components.searchableList.info', { count: data.length, total: totalCount })}</InputLabel>
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
              <TableCell component="th" scope="row">
                <CardTitle color="primary.contrastText">Name</CardTitle>
              </TableCell>
              <TableCell component="th" scope="row" sx={{ flex: 1 }}>
                &nbsp;
              </TableCell>
              <TableCell component="th" scope="row">
                <CardTitle color="primary.contrastText">Actions</CardTitle>
              </TableCell>
            </TableRow>
          </TableHead>
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
                    <TableCell component="th" scope="row" sx={{ paddingY: 1 }}>
                      {item.avatar ? (
                        <ContributorCardHorizontal
                          profile={{
                            displayName: item.value,
                            url: item.url,
                            avatar: item.avatar,
                          }}
                          seamless
                        />
                      ) : (
                        <BlockTitle component={RouterLink} to={item.url}>
                          {item.value}
                        </BlockTitle>
                      )}
                    </TableCell>
                    <TableCell component="th" scope="row" sx={{ paddingY: 1 }}>
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

export default SimpleSearchableList;
