import React, { FC } from 'react';
import { Table } from 'react-bootstrap';
import Grid from '@material-ui/core/Grid';
import { Member } from '../../../models/User';
import Button from '../../core/Button';
import { Filter } from '../Common/Filter';

interface EditMembersProps {
  members: Member[];
  availableMembers: Member[];
  onAdd?: (member: Member) => void;
  onRemove?: (member: Member) => void;
}

export const EditMembers: FC<EditMembersProps> = ({ members, availableMembers, onAdd, onRemove }) => {
  return (
    <Grid container spacing={2}>
      <Grid item>
        Group members:
        <Filter data={members}>
          {filteredMembers => (
            <>
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
                        <td>{m.displayName}</td>
                        <td>{m.firstName}</td>
                        <td>{m.lastName}</td>
                        <td>{m.email}</td>
                        <td className={'text-right'}>
                          {onRemove && <Button variant="negative" size="sm" onClick={() => onRemove(m)} text="X" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </>
          )}
        </Filter>
      </Grid>
      <Grid item sm={4}>
        Available users:
        <Filter data={availableMembers}>
          {filteredData => (
            <>
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
                        <td>{onAdd && <Button size="sm" onClick={() => onAdd(m)} text="+" />}</td>
                        <td>{m.displayName}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </>
          )}
        </Filter>
      </Grid>
    </Grid>
  );
};

export default EditMembers;
