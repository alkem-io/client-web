import React, { FC } from 'react';
import { Button, FormCheck, Nav, Navbar, Table } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useGroupMembersQuery } from '../../generated/graphql';

interface Parameters {
  groupId: string;
}

export const GroupEdit: FC = () => {
  const { groupId } = useParams<Parameters>();
  const { data, loading } = useGroupMembersQuery({ variables: { id: Number(groupId) } });

  const members = (data && data.group && data.group.members) || [];

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Navbar variant="dark" className="navbar">
        <Nav className="mr-auto">
          <Button variant="outline-primary" className="mr-2">
            Add members
          </Button>
          <Button variant="outline-primary" className="mr-2">
            Remove selected
          </Button>
        </Nav>
      </Navbar>
      <h3>{data?.group.name}</h3>
      Group members:
      {/* <SearchableList data={members} url={''} /> */}
      <Table>
        <thead>
          <tr>
            <th>
              <FormCheck id="select-all" />
            </th>
            <th>Full Name</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
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
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};

export default GroupEdit;
