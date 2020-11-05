import { gql } from '@apollo/client';
import React, { FC, useState } from 'react';
import { Button, Col, FormCheck, Nav, Navbar, Row, Table } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useGroupMembersQuery, useRemoveUserFromGroupMutation } from '../../generated/graphql';
import { GROUP_MEMBERS_FRAGMENT } from '../../graphql/admin';

interface Parameters {
  groupId: string;
}

export const GroupEdit: FC = () => {
  const { groupId } = useParams<Parameters>();
  const { data, loading } = useGroupMembersQuery({ variables: { id: Number(groupId) } });
  const [isAddPanelOpen, setAddPanelState] = useState(false);
  const members = (data && data.group && data.group.members) || [];
  const [removeUserFromGroup, { loading: removing }] = useRemoveUserFromGroupMutation({
    onError: error => {
      // setShowError(true);
      console.log(error);
    },
    onCompleted: data => {
      // setIsBlocked(true);
      // setShowSuccess(true);
    },
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
  });

  if (loading) return <div>Loading...</div>;

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

  return (
    <>
      <Navbar variant="dark" className="navbar">
        <Nav className="mr-auto">
          <Button variant="outline-primary" className="mr-2" onClick={() => setAddPanelState(prev => !prev)}>
            Add members
          </Button>
          <Button variant="outline-primary" className="mr-2">
            Remove selected
          </Button>
        </Nav>
      </Navbar>
      <h3>{data?.group.name}</h3>
      {removing && <div>Removing...</div>}
      Group members:
      <Row>
        <Col>
          <Table hover size="sm" responsive="sm">
            <thead className="thead-dark">
              <tr>
                <th>
                  <FormCheck id="select-all" />
                </th>
                <th>Full Name</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>delete</th>
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.email}>
                  <td>
                    <FormCheck id={m.email} />
                  </td>
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
        </Col>
        {isAddPanelOpen && <Col sm={3}>Members</Col>}
      </Row>
    </>
  );
};

export default GroupEdit;
