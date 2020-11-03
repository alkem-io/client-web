import React, { FC, useState } from 'react';
import { Button, Col, FormCheck, Nav, Navbar, Row, Table } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useGroupMembersQuery, useRemoveUserFromGroupMutation } from '../../generated/graphql';

interface Parameters {
  groupId: string;
}

export const GroupEdit: FC = () => {
  const { groupId } = useParams<Parameters>();
  const { data, loading } = useGroupMembersQuery({ variables: { id: Number(groupId) } });
  const [isAddPanelOpen, setAddPanelState] = useState(false);
  const members = (data && data.group && data.group.members) || [];
  const [removeUser, { loading: removing }] = useRemoveUserFromGroupMutation({
    onError: error => {
      // setShowError(true);
      console.log(error);
    },
    onCompleted: data => {
      // setIsBlocked(true);
      // setShowSuccess(true);
    },
    update: (cache, { data }) => {
      if (data) {
        const { removeUserFromGroup } = data;

        // cache.modify({
        //   fields: {
        //     users(existingTodos = []) {
        //       const newUserRef = cache.writeFragment({
        //         data: removeUserFromGroup,
        //         fragment: gql`
        //           fragment UpdateMembers on Group {
        //             id
        //             name
        //             firstName
        //             lastName
        //             email
        //             phone
        //             city
        //             country
        //             gender
        //           }
        //         `,
        //       });
        //       return [...existingTodos, newUserRef];
        //     },
        //   },
        // });
      }
    },
  });
  if (loading) return <div>Loading...</div>;

  const removeMember = (member: string) => {
    // removeUser({ gro });
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
                    <Button variant="outline-danger" size="sm" onClick={() => removeMember(m.email)}>
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
