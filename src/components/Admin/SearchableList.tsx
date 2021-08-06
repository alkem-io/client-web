import { ReactComponent as Trash } from 'bootstrap-icons/icons/trash.svg';
import React, { FC, Fragment, useMemo, useState } from 'react';
import { FormControl, FormGroup, FormLabel, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Button from '../core/Button';
import Icon from '../core/Icon';
import IconButton from '../core/IconButton';
import RemoveModal from '../core/RemoveModal';
import { useTranslation } from 'react-i18next';

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

export interface SearchableListItem {
  id: string;
  value: string;
  url: string;
}

export const SearchableList: FC<SearchableListProps> = ({ data = [], edit = false, active, onDelete }) => {
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
      <FormGroup style={{ flexDirection: 'column' }} className={'justify-content-end'}>
        <FormControl placeholder="Search" arial-label="Search" onChange={handleSearch} />
        <FormLabel> {`Showing ${slicedData.length} of ${data.length}`}</FormLabel>
      </FormGroup>
      <hr />
      <ListGroup>
        {slicedData.map(item => (
          <Fragment key={item.id}>
            <ListGroup.Item
              as={Link}
              action
              to={`${item.url}${editSuffix}`}
              active={active !== undefined && item.id === active}
              className={'d-flex'}
            >
              {item.value}
              <div className={'flex-grow-1'} />
              {onDelete && (
                <IconButton onClick={e => openModal(e, item)}>
                  <Icon component={Trash} color="negative" size={'sm'} />
                </IconButton>
              )}
            </ListGroup.Item>
          </Fragment>
        ))}
      </ListGroup>
      <RemoveModal
        show={isModalOpened}
        onCancel={closeModal}
        onConfirm={handleRemoveItem}
        text={`Are you sure you want to remove: ${itemToRemove?.value}`}
        //loading={loading}
      />
      {filteredData.length > limit && limit < 50 && (
        <Button
          className={'mt-4'}
          onClick={() => setLimit(x => (x >= 50 ? x : x + 10))}
          text={t('components.searchableList.load-more')}
        />
      )}
    </>
  );
};

export default SearchableList;
