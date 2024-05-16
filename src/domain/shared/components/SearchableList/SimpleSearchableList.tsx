import { FormControl, InputLabel, List, OutlinedInput } from '@mui/material';
import Delete from '@mui/icons-material/Delete';
import React, { forwardRef, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SearchableListIconButton from './SearchableListIconButton';
import RemoveModal from '../../../../core/ui/dialogs/RemoveModal';
import useLazyLoading from '../../pagination/useLazyLoading';
import LoadingListItem from './LoadingListItem';
import ListItemLink from './ListItemLink';
import { times } from 'lodash';

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
}

export interface SearchableListItem {
  id: string;
  value: string;
  url: string;
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

  const openModal = (e: Event, item: SearchableListItem): void => {
    e.preventDefault();
    setModalOpened(true);
    setItemToRemove(item);
  };

  const closeModal = (): void => {
    setModalOpened(false);
    setItemToRemove(null);
  };

  return (
    <>
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
      <hr />
      <List>
        {loading && !data
          ? times(firstPageSize, i => <LoadingListItem key={`__loading_${i}`} />)
          : data.map(item => (
              <ListItemLink
                key={item.id}
                to={item.url}
                primary={item.value}
                icon={
                  onDelete && (
                    <SearchableListIconButton
                      onClick={e => openModal(e, item)}
                      size="large"
                      aria-label={t('buttons.delete')}
                    >
                      <Delete color="error" fontSize="large" />
                    </SearchableListIconButton>
                  )
                }
              />
            ))}
        {loader}
      </List>
      <RemoveModal
        show={isModalOpened}
        onCancel={closeModal}
        onConfirm={handleRemoveItem}
        text={`Are you sure you want to remove: ${itemToRemove?.value}`}
      />
    </>
  );
};

export default SimpleSearchableList;
