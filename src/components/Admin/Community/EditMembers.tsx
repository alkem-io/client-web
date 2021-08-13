import React, { FC } from 'react';
import Grid from '@material-ui/core/Grid';
import { Member } from '../../../models/User';
import Button from '../../core/Button';
import { Filter } from '../Common/Filter';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core';

interface EditMembersProps {
  members: Member[];
  availableMembers: Member[];
  onAdd?: (member: Member) => void;
  onRemove?: (member: Member) => void;
}

const useStyles = makeStyles(theme => ({
  thead: {
    background: theme.palette.divider,
  },
  trow: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

export const EditMembers: FC<EditMembersProps> = ({ members, availableMembers, onAdd, onRemove }) => {
  const styles = useStyles();
  return (
    <Grid container spacing={2}>
      <Grid item>
        Group members:
        <Filter data={members}>
          {filteredMembers => (
            <>
              <hr />
              <div style={{ position: 'relative', height: 600, overflow: 'hidden', overflowY: 'auto' }}>
                <Table size="small">
                  <TableHead className={styles.thead}>
                    <TableRow>
                      <TableCell>Full Name</TableCell>
                      <TableCell>First Name</TableCell>
                      <TableCell>Last Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredMembers.map(m => (
                      <TableRow key={m.email} className={styles.trow}>
                        <TableCell>{m.displayName}</TableCell>
                        <TableCell>{m.firstName}</TableCell>
                        <TableCell>{m.lastName}</TableCell>
                        <TableCell>{m.email}</TableCell>
                        <TableCell align={'right'}>
                          {onRemove && <Button variant="negative" size="small" onClick={() => onRemove(m)} text="X" />}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </Filter>
      </Grid>
      <Grid item sm={4}>
        Available users:
        <Filter data={availableMembers}>
          {filteredData => {
            return (
              <>
                <hr />
                <div style={{ height: 600, overflow: 'hidden', overflowY: 'auto' }}>
                  <TableContainer component={Paper}>
                    <Table size="small" style={{ position: 'relative' }}>
                      <TableHead className={styles.thead}>
                        <TableRow>
                          <TableCell />
                          <TableCell>Full Name</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredData.map(m => (
                          <TableRow key={m.email} className={styles.trow}>
                            <TableCell>{onAdd && <Button size="small" onClick={() => onAdd(m)} text="+" />}</TableCell>
                            <TableCell>{m.displayName}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </div>
              </>
            );
          }}
        </Filter>
      </Grid>
    </Grid>
  );
};

export default EditMembers;
