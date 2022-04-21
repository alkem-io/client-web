import {
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  OutlinedInput,
  Skeleton,
  Box,
} from '@mui/material';
import Delete from '@mui/icons-material/Delete';
import React, { FC, ReactElement, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';
import Button from '../core/Button';
import IconButton from '../core/IconButton';
import RemoveModal from '../core/RemoveModal';

interface SearchableListProps {
  data: SearchableListItem[];
  edit?: boolean;
  active?: number | string;
  onDelete?: (item: SearchableListItem) => void;
  loading?: boolean;
}

export const searchableListItemMapper =
  (editSuffix?: string) =>
  (item: { id: string; displayName: string; nameID?: string }): SearchableListItem => ({
    id: item.id,
    value: item.displayName,
    url: `${item.nameID ?? item.id}${editSuffix ?? ''}`,
  });

const LoadingListItem = () => (
  <Box height="50px" display="flex" justifyContent="space-between">
    <Skeleton width="50%" />
    <Skeleton width="5%" />
  </Box>
);

interface ListItemLinkProps {
  icon?: ReactElement;
  primary: string;
  to: string;
}

const ListItemLink = (props: ListItemLinkProps) => {
  const { icon, primary, to } = props;

  const Link = React.useMemo(
    () =>
      React.forwardRef<any, Omit<RouterLinkProps, 'to'>>((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to]
  );

  return (
    <li>
      <ListItem button component={Link}>
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

export const SearchableList: FC<SearchableListProps> = ({ data = [], edit = false, onDelete, loading }) => {
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
            <ListItemLink
              key={item.id}
              to={`${item.url}${editSuffix}`}
              primary={item.value}
              icon={
                onDelete && (
                  <IconButton onClick={e => openModal(e, item)} size="large">
                    <Delete color="error" fontSize="large" />
                  </IconButton>
                )
              }
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
      {filteredData.length > limit && limit < 50 && (
        <Button onClick={() => setLimit(x => (x >= 50 ? x : x + 10))} text={t('components.searchableList.load-more')} />
      )}
    </>
  );
};

export default SearchableList;
