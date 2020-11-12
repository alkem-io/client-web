import React, { FC, useMemo, useState, Fragment } from 'react';
import { FormControl, InputGroup } from 'react-bootstrap';
import { ReactComponent as Trash } from 'bootstrap-icons/icons/trash.svg';
import ListGroup from 'react-bootstrap/esm/ListGroup';
import { Link } from 'react-router-dom';
import IconButton from '../core/IconButton';
import Icon from '../core/Icon';
import UserRemoveModal from './UserRemoveModal';
import { useRemoveUserMutation } from '../../generated/graphql';

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

export const SearchableList: FC<SearchableListProps> = ({ data = [], edit = false, children, active }) => {
  const [filterBy, setFilterBy] = useState('');
  const [isModalOpened, setModalOpened] = useState<boolean>(false);
  const [userToRemove, setUserToRemove] = useState<SearchableListData | null>(null);

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
  const editSuffix = edit ? '/edit' : '';

  const handleRemoveUser = () => {
    remove({
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
      <InputGroup>
        <FormControl placeholder="Search" arial-label="Search" onChange={handleSearch} />
      </InputGroup>
      <hr />
      {children}
      <ListGroup>
        {filteredData.map(item => (
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
    </>
  );
};

export default SearchableList;
