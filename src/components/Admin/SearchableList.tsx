import React, { FC, useMemo, useState, Fragment } from 'react';
import { FormControl, FormGroup, FormLabel } from 'react-bootstrap';
import { ReactComponent as Trash } from 'bootstrap-icons/icons/trash.svg';
import ListGroup from 'react-bootstrap/esm/ListGroup';
import { Link } from 'react-router-dom';
import IconButton from '../core/IconButton';
import Icon from '../core/Icon';
import UserRemoveModal from './User/UserRemoveModal';
import { useRemoveUserMutation } from '../../generated/graphql';
import Button from '../core/Button';

interface SearchableListProps {
  data: SearchableListData[];
  edit?: boolean;
  active?: number | string;
}

export interface SearchableListData {
  id: string;
  value: string;
  url: string;
}

export const SearchableList: FC<SearchableListProps> = ({ data = [], edit = false, active }) => {
  const [filterBy, setFilterBy] = useState('');
  const [isModalOpened, setModalOpened] = useState<boolean>(false);
  const [userToRemove, setUserToRemove] = useState<SearchableListData | null>(null);
  const [limit, setLimit] = useState(10);

  const [remove, { loading }] = useRemoveUserMutation({
    refetchQueries: ['users'],
    awaitRefetchQueries: true,
    onCompleted: () => {
      setModalOpened(false);
      setUserToRemove(null);
    },
    onError: e => console.error('User remove error---> ', e),
  });

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

  const handleRemoveUser = async () => {
    await remove({
      variables: {
        userID: Number(userToRemove?.id),
      },
    });
  };

  const openModal = (e: Event, item: SearchableListData): void => {
    e.preventDefault();
    setModalOpened(true);
    setUserToRemove(item);
  };

  const closeModal = (): void => {
    setModalOpened(false);
    setUserToRemove(null);
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
              <IconButton onClick={e => openModal(e, item)}>
                <Icon component={Trash} color="negative" size={'sm'} />
              </IconButton>
            </ListGroup.Item>
          </Fragment>
        ))}
      </ListGroup>
      <UserRemoveModal
        show={isModalOpened}
        onCancel={closeModal}
        onConfirm={handleRemoveUser}
        name={userToRemove?.value}
        loading={loading}
      />
      {filteredData.length > limit && limit < 50 && (
        <Button className={'mt-4'} onClick={() => setLimit(x => (x >= 50 ? x : x + 10))}>
          Load more
        </Button>
      )}
    </>
  );
};

export default SearchableList;
