import React, { FC, useMemo, useState } from 'react';
import { Button, FormControl, InputGroup, Table } from 'react-bootstrap';
import { useUsersQuery } from '../../generated/graphql';
import Loading from '../core/Loading';

interface UserListProps {
  existingMembersIds: string[];
  onUserAdd?: (id: string) => void;
}

export const MemberSelector: FC<UserListProps> = ({ existingMembersIds = [], onUserAdd }) => {
  const { data, loading } = useUsersQuery();

  const unusedMembers = data?.users.filter(u => !existingMembersIds.includes(u.id)) || [];
  const [filterBy, setFilterBy] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilterBy(value);
  };

  const filteredData = useMemo(
    () => unusedMembers.filter(item => (filterBy ? item.name.toLowerCase().includes(filterBy.toLowerCase()) : true)),
    [filterBy, unusedMembers]
  );

  const handleOnAddClick = id => {
    if (onUserAdd) {
      onUserAdd(id);
    }
  };

  if (loading) return <Loading />;

  return (
    <>
      Available users:
      <InputGroup>
        <FormControl placeholder="Search" arial-label="Search" onChange={handleSearch} />
      </InputGroup>
      <hr />
      <div style={{ height: 600, overflow: 'hidden', overflowY: 'auto' }}>
        <Table hover size="sm" responsive="sm" style={{ position: 'relative' }}>
          <thead className="thead-dark">
            <tr>
              <th />
              <th>Full Name</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(m => (
              <tr key={m.email}>
                <td>
                  <Button variant="outline-info" size="sm" onClick={() => handleOnAddClick(m.id)}>
                    +
                  </Button>
                </td>
                <td>{m.name}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </>
  );
};
export default MemberSelector;
