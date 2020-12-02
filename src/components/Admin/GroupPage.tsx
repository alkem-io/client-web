import React, { FC, useMemo, useState } from 'react';
import { Button, Col, FormControl, InputGroup, Row, Table } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import {
  useAddUserToChallengeMutation,
  useAddUserToGroupMutation,
  useAddUserToOpportunityMutation,
  useGroupMembersQuery,
  useRemoveUserFromGroupMutation,
} from '../../generated/graphql';
import { useUpdateNavigation } from '../../hooks/useNavigation';
import { PageProps } from '../../pages';
import Loading from '../core/Loading';
import MemberSelector from './MemberSelector';

interface Parameters {
  groupId: string;
  challengeId: string;
  opportunityId: string;
}

type GroupPageProps = PageProps;

export const GroupPage: FC<GroupPageProps> = ({ paths }) => {
  const { groupId, challengeId, opportunityId } = useParams<Parameters>();

  const [addUserToGroup] = useAddUserToGroupMutation();
  const [addUserToChallenge] = useAddUserToChallengeMutation();
  const [addUserToOpportunity] = useAddUserToOpportunityMutation();
  const [removeUserFromGroup] = useRemoveUserFromGroupMutation();
  const { data } = useGroupMembersQuery({ variables: { id: Number(groupId) } });

  const [filterBy, setFilterBy] = useState('');

  const members = data?.group?.members || [];
  const filteredMembers = members.filter(item =>
    filterBy ? item.name.toLowerCase().includes(filterBy.toLowerCase()) : true
  );
  const existingMembersIds = useMemo(() => members.map(x => x.id), [members]);
  const groupName = data?.group.name || '';
  const currentPaths = useMemo(() => [...paths, { name: groupName, real: false }], [paths, groupName]);
  useUpdateNavigation({ currentPaths });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilterBy(value);
  };

  const gqlOptions = (userID, variable) => ({
    refetchQueries: ['groupMembers'],
    awaitRefetchQueries: true,
    variables: {
      userID: Number(userID),
      ...variable,
    },
  });

  const removeMember = async (userID: string) => {
    await removeUserFromGroup(gqlOptions(userID, { groupID: Number(groupId) }));
  };
  // TODO [ATS] Find a way to update the cache instead of doing second query
  // update: (cache, { data }) => {
  //   const fragment = GROUP_MEMBERS_FRAGMENT;
  //   if (data) {
  //     const { removeUserFromGroup } = data;
  //     cache.modify({
  //       id: groupId,
  //       fields: {
  //         members(existingMembers = [], { readField }) {
  //           return existingMembers.filter(memberRef => {
  //             if (!removeUserFromGroup.members) return true;
  //             return removeUserFromGroup.members.some(m => m.id === readField('id', memberRef));
  //           });
  //           // const newMembers = cache.writeFragment({
  //           //   data: removeUserFromGroup.members,
  //           //   fragment,
  //           // });
  //           // return [newMembers];
  //         },
  //       },
  //     });
  //   }
  // },
  // });

  const handleUserAdding = async (userID: string) => {
    if (opportunityId) await addUserToOpportunity(gqlOptions(userID, { opportunityID: Number(opportunityId) }));
    else if (challengeId) await addUserToChallenge(gqlOptions(userID, { challengeID: Number(challengeId) }));
    else await addUserToGroup(gqlOptions(userID, { groupID: Number(groupId) }));
  };

  return (
    <>
      <Row>
        <Col>
          Group members:
          <InputGroup>
            <FormControl placeholder="Search" arial-label="Search" onChange={handleSearch} />
          </InputGroup>
          <hr />
          <div style={{ position: 'relative', height: 600, overflow: 'hidden', overflowY: 'auto' }}>
            <Table hover size="sm" responsive="sm">
              <thead className="thead-dark">
                <tr>
                  <th>Full Name</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Email</th>
                  <th>Remove</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map(m => (
                  <tr key={m.email}>
                    <td>{m.name}</td>
                    <td>{m.firstName}</td>
                    <td>{m.lastName}</td>
                    <td>{m.email}</td>
                    <td>
                      <Button variant="outline-danger" size="sm" onClick={() => removeMember(m.id)}>
                        X
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Col>
        <Col sm={4}>
          <MemberSelector existingMembersIds={existingMembersIds} onUserAdd={handleUserAdding} />{' '}
        </Col>
      </Row>
    </>
  );
};

export default GroupPage;
