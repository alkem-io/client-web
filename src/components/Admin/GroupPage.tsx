import React, { FC, useMemo, useState } from 'react';
import { Button, Col, FormControl, InputGroup, Nav, Navbar, Row, Table } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import {
  useAddUserToGroupMutation,
  useGroupMembersQuery,
  useRemoveUserFromGroupMutation,
} from '../../generated/graphql';
import { useUpdateNavigation } from '../../hooks/useNavigation';
import { PageProps } from '../../pages';
import Loading from '../core/Loading';
import MemberSelector from './MemberSelector';

interface Parameters {
  groupId: string;
}

type GroupPageProps = PageProps;

export const GroupPage: FC<GroupPageProps> = ({ paths }) => {
  const { groupId } = useParams<Parameters>();

  const { data, loading } = useGroupMembersQuery({ variables: { id: Number(groupId) } });
  const [filterBy, setFilterBy] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilterBy(value);
  };
  const groupName = (data && data.group.name) || '';

  const currentPaths = useMemo(() => [...paths, { name: groupName, real: false }], [paths, groupName]);
  useUpdateNavigation({ currentPaths });

  const members = (data && data.group && data.group.members) || [];
  const filteredMembers = members.filter(item =>
    filterBy ? item.name.toLowerCase().includes(filterBy.toLowerCase()) : true
  );
  const mutationHandler = {
    onError: error => {
      // setShowError(true);
      console.log(error);
    },
    onCompleted: () => {
      // setShowSuccess(true);
    },
  };

  const [addUserToGroup, { loading: adding }] = useAddUserToGroupMutation(mutationHandler);
  const [removeUserFromGroup, { loading: removing }] = useRemoveUserFromGroupMutation(mutationHandler);
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
  const existingMembersIds = useMemo(() => members.map(x => x.id), [members]);
  const removeMember = async (userID: string) => {
    await removeUserFromGroup({
      refetchQueries: ['groupMembers'],
      awaitRefetchQueries: true,
      variables: {
        groupID: Number(groupId),
        userID: Number(userID),
      },
    });
  };

  const handleUserAdding = async (userID: string) => {
    await addUserToGroup({
      refetchQueries: ['groupMembers'],
      awaitRefetchQueries: true,
      variables: {
        groupID: Number(groupId),
        userID: Number(userID),
      },
    });
  };

  if (loading) return <Loading text={'Loading Groups ...'} />;

  return (
    <>
      <Navbar variant="dark" className="navbar">
        <Nav className="mr-auto">
          {removing && <div>Removing...</div>}
          {adding && <div>Adding...</div>}
          {/* <Button variant="outline-primary" className="mr-2">
            Remove selected
          </Button> */}
        </Nav>
      </Navbar>
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
                  {/* <th>
                  <FormCheck id="select-all" />
                </th> */}
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
                    {/* <td>
                    <FormCheck id={m.email} />
                  </td> */}
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
