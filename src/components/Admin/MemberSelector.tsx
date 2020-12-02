import React, { FC, useEffect, useMemo, useState } from 'react';
import { Button, FormControl, InputGroup, Table } from 'react-bootstrap';
import { useChallengeMembersLazyQuery, useUsersLazyQuery } from '../../generated/graphql';
import Loading from '../core/Loading';
import { useParams } from 'react-router-dom';

interface UserListProps {
  existingMembersIds: string[];
  onUserAdd?: (id: string) => void;
}

interface Parameters {
  groupId: string;
  challengeId: string;
  opportunityId: string;
}

export const MemberSelector: FC<UserListProps> = ({ existingMembersIds = [], onUserAdd }) => {
  const { challengeId, opportunityId } = useParams<Parameters>();

  const [getAllUsers, { data: users, loading }] = useUsersLazyQuery();
  const [getChallengeMembers, { data: opportunityMembers }] = useChallengeMembersLazyQuery({
    variables: { challengeID: Number(challengeId) },
  });

  const members = users?.users || opportunityMembers?.challenge.contributors;

  const getMembers = () => {
    if (opportunityId) {
      getChallengeMembers();
    } else getAllUsers();
  };

  useEffect(() => {
    getMembers();
  }, [existingMembersIds]);

  const unusedMembers = members?.filter(u => !existingMembersIds.includes(u.id)) || [];
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

  if (loading) return <Loading text={'Loading members ...'} />;

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
