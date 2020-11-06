import React, { FC, useMemo, useState } from 'react';
import { Button, Col, FormControl, InputGroup, Nav, Navbar, Row, Table } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import {
  useAddUserToGroupMutation,
  useGroupMembersQuery,
  useRemoveUserFromGroupMutation,
} from '../../generated/graphql';
import MemberSelector from './MemberSelector';

interface Parameters {
  groupId: string;
}

export const GroupEdit: FC = () => {
  const { groupId } = useParams<Parameters>();
  const { data, loading } = useGroupMembersQuery({ variables: { id: Number(groupId) } });
  const [isAddPanelOpen, setAddPanelState] = useState(true);
  const [filterBy, setFilterBy] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilterBy(value);
  };

  const members = (data && data.group && data.group.members) || [];
  const filterdMembers = members.filter(item =>
    filterBy ? item.name.toLowerCase().includes(filterBy.toLowerCase()) : true
  );
  const mutationHanlder = {
    onError: error => {
      // setShowError(true);
      console.log(error);
    },
    onCompleted: data => {
      // setShowSuccess(true);
    },
  };

  const [addUserToGroup, { loading: adding }] = useAddUserToGroupMutation(mutationHanlder);
  const [removeUserFromGroup, { loading: removing }] = useRemoveUserFromGroupMutation(mutationHanlder);
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
  console.log(existingMembersIds);
  const removeMember = (userID: string) => {
    removeUserFromGroup({
      refetchQueries: ['groupMembers'],
      awaitRefetchQueries: true,
      variables: {
        groupID: Number(groupId),
        userID: Number(userID),
      },
    });
  };

  const handleUserAdding = (userID: string) => {
    addUserToGroup({
      refetchQueries: ['groupMembers'],
      awaitRefetchQueries: true,
      variables: {
        groupID: Number(groupId),
        userID: Number(userID),
      },
    });
  };

  // if (loading) return <div>Loading...</div>;

  return (
    <>
      <Navbar variant="dark" className="navbar">
        <Nav className="mr-auto">
          <Button variant="outline-primary" className="mr-2" onClick={() => setAddPanelState(prev => !prev)}>
            Add members
          </Button>
          {removing && <div>Removing...</div>}
          {adding && <div>Adding...</div>}
          {/* <Button variant="outline-primary" className="mr-2">
            Remove selected
          </Button> */}
        </Nav>
      </Navbar>
      <h3>{data?.group.name}</h3>
      <Row>
        <Col>
          Group members:
          <InputGroup>
            <FormControl placeholder="Search" arial-label="Search" onChange={handleSearch} />
          </InputGroup>
          <hr />
          <div style={{ position: 'relative', height: 400, overflow: 'hidden', overflowY: 'auto' }}>
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
                  <th>delete</th>
                </tr>
              </thead>
              <tbody>
                {filterdMembers.map(m => (
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
        {isAddPanelOpen && (
          <Col sm={4}>
            <MemberSelector existingMembersIds={existingMembersIds} onUserAdd={handleUserAdding} />{' '}
          </Col>
        )}
      </Row>
    </>
  );
};

export default GroupEdit;
