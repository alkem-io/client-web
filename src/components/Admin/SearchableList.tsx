import { FormControl, InputLabel, List, ListItem, ListItemIcon, ListItemText, OutlinedInput } from '@material-ui/core';
import { ReactComponent as Trash } from 'bootstrap-icons/icons/trash.svg';
import React, { FC, ReactElement, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';
import Button from '../core/Button';
import Icon from '../core/Icon';
import IconButton from '../core/IconButton';
import RemoveModal from '../core/RemoveModal';

interface SearchableListProps {
  data: SearchableListItem[];
  edit?: boolean;
  active?: number | string;
  onDelete?: (item: SearchableListItem) => void;
}

export const searchableListItemMapper =
  (url: string, editSuffix?: string) =>
  (item: { id: string; displayName: string; nameID?: string }): SearchableListItem => ({
    id: item.id,
    value: item.displayName,
    url: `${url}/${item.nameID ?? item.id}${editSuffix ?? ''}`,
  });

interface ListItemLinkProps {
  icon?: ReactElement;
  primary: string;
  to: string;
}

const ListItemLink = (props: ListItemLinkProps) => {
  const { icon, primary, to } = props;

  const renderLink = React.useMemo(
    () =>
      React.forwardRef<any, Omit<RouterLinkProps, 'to'>>((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to]
  );

  return (
    <li>
      <ListItem button component={renderLink}>
        <ListItemText primary={primary} />
        {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
      </ListItem>
    </li>
  );
};
export interface SearchableListItem {
  id: string;
  value: string;
  url: string;
}

export const SearchableList: FC<SearchableListProps> = ({ data = [], edit = false, onDelete }) => {
  const { t } = useTranslation();
  const [filterBy, setFilterBy] = useState('');
  const [isModalOpened, setModalOpened] = useState<boolean>(false);
  const [itemToRemove, setItemToRemove] = useState<SearchableListItem | null>(null);
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
      <FormControl fullWidth size={'small'}>
        <OutlinedInput placeholder={t('components.searchableList.placeholder')} onChange={handleSearch} />
      </FormControl>
      <InputLabel> {t('components.searchableList.info', { count: slicedData.length, total: data.length })}</InputLabel>
      <hr />
      <List>
        {slicedData.map(item => (
          <ListItemLink
            key={item.id}
            to={`${item.url}${editSuffix}`}
            primary={item.value}
            icon={
              <IconButton onClick={e => openModal(e, item)}>
                <Icon component={Trash} color="negative" size={'sm'} />
              </IconButton>
            }
          />
        ))}
      </List>
      <RemoveModal
        show={isModalOpened}
        onCancel={closeModal}
        onConfirm={handleRemoveItem}
        text={`Are you sure you want to remove: ${itemToRemove?.value}`}
      />
      {filteredData.length > limit && limit < 50 && (
        <Button onClick={() => setLimit(x => (x >= 50 ? x : x + 10))} text={t('components.searchableList.load-more')} />
      )}
    </>
  );
};

export default SearchableList;
