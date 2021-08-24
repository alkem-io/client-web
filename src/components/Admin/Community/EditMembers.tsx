import React, { FC } from 'react';
import { Box, makeStyles } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import { Member } from '../../../models/User';
import { Filter } from '../Common/Filter';

const TABLE_HEIGHT = 600;

export interface EditMembersProps {
  deleteExecutor?: boolean;
  executor?: Member;
  members: Member[];
  availableMembers: Member[];
  addingMember?: boolean;
  removingMember?: boolean;
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
  iconButtonSuccess: {
    color: theme.palette.success.main,
  },
  iconButtonNegative: {
    color: theme.palette.negative.main,
  },
}));

export const EditMembers: FC<EditMembersProps> = ({
  members,
  availableMembers,
  deleteExecutor = false,
  executor,
  addingMember = false,
  removingMember = false,
  onAdd,
  onRemove,
}) => {
  const styles = useStyles();
  return (
    <Grid container spacing={2}>
      <Grid item xs={8}>
        Group members:
        <Filter data={members}>
          {filteredMembers => (
            <>
              <hr />
              <Box component={'div'} height={TABLE_HEIGHT} overflow={'auto'}>
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
                    {filteredMembers.map(m => {
                      const disableExecutor = m.id === executor?.id && !deleteExecutor;
                      return (
                        <TableRow key={m.email} className={styles.trow}>
                          <TableCell>{m.displayName}</TableCell>
                          <TableCell>{m.firstName}</TableCell>
                          <TableCell>{m.lastName}</TableCell>
                          <TableCell>{m.email}</TableCell>
                          <TableCell align={'right'}>
                            {onRemove && (
                              <IconButton
                                aria-label="Remove"
                                size="small"
                                disabled={disableExecutor || addingMember || removingMember}
                                className={styles.iconButtonNegative}
                                onClick={() => onRemove(m)}
                              >
                                <RemoveIcon />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Box>
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
                <Box component={'div'} height={TABLE_HEIGHT} overflow={'auto'}>
                  <TableContainer>
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
                            <TableCell>
                              {onAdd && (
                                <IconButton
                                  aria-label="Add"
                                  size="small"
                                  onClick={() => onAdd(m)}
                                  className={styles.iconButtonSuccess}
                                  disabled={addingMember || removingMember}
                                >
                                  <AddIcon />
                                </IconButton>
                              )}
                            </TableCell>
                            <TableCell>{m.displayName}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </>
            );
          }}
        </Filter>
      </Grid>
    </Grid>
  );
};

export default EditMembers;
