import { Button, FormControl, InputLabel, List, OutlinedInput } from '@mui/material';
import Delete from '@mui/icons-material/Delete';
import React, { ComponentType, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SearchableListIconButton from '../../../shared/components/SearchableList/SearchableListIconButton';
import RemoveModal from '@core/ui/dialogs/RemoveModal';
import LoadingListItem from '../../../shared/components/SearchableList/LoadingListItem';
import ListItemLink, { ListItemLinkProps } from '../../../shared/components/SearchableList/ListItemLink';
import { omit } from 'lodash';

const MAX_ITEMS_LIMIT = 1000;

export interface SearchableTableProps<
  ItemViewProps extends {},
  Item extends SearchableTableItem & Omit<ItemViewProps, keyof ListItemLinkProps>
> {
  data: Item[];
  edit?: boolean;
  active?: number | string;
  onDelete?: (item: Item) => void;
  loading?: boolean;
  itemViewComponent?: ComponentType<ItemViewProps & ListItemLinkProps>;
}

export const SearchableTableItemMapper =
  (editSuffix?: string) =>
  (item: { id: string; displayName: string; nameID?: string; url?: string }): SearchableTableItem => ({
    id: item.id,
    value: item.displayName,
    url: item.url ?? `${item.nameID ?? item.id}${editSuffix ?? ''}`,
  });

export interface SearchableTableItem {
  id: string;
  value: string;
  url: string;
}

export const SearchableTable = <
  ItemViewProps extends {},
  Item extends SearchableTableItem & Omit<ItemViewProps, keyof ListItemLinkProps>
>({
  data = [],
  edit = false,
  onDelete,
  loading,
  itemViewComponent = ListItemLink,
}: SearchableTableProps<ItemViewProps, Item>) => {
  const { t } = useTranslation();
  const [filterBy, setFilterBy] = useState('');
  const [isModalOpened, setModalOpened] = useState<boolean>(false);
  const [itemToRemove, setItemToRemove] = useState<Item | null>(null);
  const [limit, setLimit] = useState(10);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilterBy(value);
  };

  const filteredData = useMemo(
    () => data.filter(item => (filterBy ? item.value.toLowerCase().includes(filterBy.toLowerCase()) : true)),
    [filterBy, data]
  );

  const slicedData = useMemo(() => filteredData.slice(0, limit), [filteredData, limit]);
  const editSuffix = edit ? '/edit' : '';

  const handleRemoveItem = async () => {
    if (onDelete && itemToRemove) {
      onDelete(itemToRemove);
      closeModal();
    }
  };

  const openModal = (e: Event, item: Item): void => {
    e.preventDefault();
    setModalOpened(true);
    setItemToRemove(item);
  };

  const closeModal = (): void => {
    setModalOpened(false);
    setItemToRemove(null);
  };

  const ItemView = itemViewComponent as ComponentType<ListItemLinkProps>;

  return (
    <>
      <FormControl fullWidth size={'small'}>
        <OutlinedInput
          placeholder={t('components.searchableList.placeholder')}
          onChange={handleSearch}
          sx={{ background: theme => theme.palette.primary.contrastText }}
        />
      </FormControl>
      <InputLabel> {t('components.searchableList.info', { count: slicedData.length, total: data.length })}</InputLabel>
      <hr />
      <List>
        {loading ? (
          <>
            <LoadingListItem />
            <LoadingListItem />
            <LoadingListItem />
            <LoadingListItem />
            <LoadingListItem />
            <LoadingListItem />
          </>
        ) : (
          slicedData.map(item => (
            <ItemView
              key={item.id}
              to={`${item.url}${editSuffix}`}
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
              {...omit(item, 'id', 'url', 'value')}
            />
          ))
        )}
      </List>
      <RemoveModal
        show={isModalOpened}
        onCancel={closeModal}
        onConfirm={handleRemoveItem}
        text={`Are you sure you want to remove: ${itemToRemove?.value}`}
      />
      {filteredData.length > limit && limit < MAX_ITEMS_LIMIT && (
        <Button
          onClick={() => setLimit(x => (x >= MAX_ITEMS_LIMIT ? x : x + 10))}
          variant="outlined"
          sx={{ alignSelf: 'start' }}
        >
          {t('components.searchableList.load-more')}
        </Button>
      )}
    </>
  );
};

export default SearchableTable;
