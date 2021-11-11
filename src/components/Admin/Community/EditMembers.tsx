import { Box, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Member } from '../../../models/User';
import { Filter } from '../Common/Filter';
import { UserDisplayNameFragment } from '../../../models/graphql-schema';
import { Skeleton } from '@mui/material';

const TABLE_HEIGHT = 600;

export interface EditMembersProps {
  deleteExecutor?: boolean;
  executor?: Member;
  members: Member[];
  availableMembers: UserDisplayNameFragment[];
  addingMember?: boolean;
  removingMember?: boolean;
  loadingAvailableMembers?: boolean;
  loadingMembers?: boolean;
  onAdd?: (member: UserDisplayNameFragment) => void;
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
  loadingAvailableMembers = false,
  loadingMembers = false,
  onAdd,
  onRemove,
}) => {
  const styles = useStyles();

  const membersData = useMemo<Member[]>(
    () => (loadingMembers ? new Array(3).fill({}) : members),
    [loadingMembers, members]
  );
  const Cell = useMemo(() => (loadingMembers ? Skeleton : React.Fragment), [loadingMembers]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={8}>
        Group members:
        <Filter data={membersData}>
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
                      {onRemove && <TableCell />}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredMembers.map(m => {
                      const disableExecutor = m.id === executor?.id && !deleteExecutor;
                      return (
                        <TableRow key={m.email} className={styles.trow}>
                          <TableCell>
                            <Cell>{m.displayName}</Cell>
                          </TableCell>
                          <TableCell>
                            <Cell>{m.firstName}</Cell>
                          </TableCell>
                          <TableCell>
                            <Cell>{m.lastName}</Cell>
                          </TableCell>
                          <TableCell>
                            <Cell>{m.email}</Cell>
                          </TableCell>
                          {onRemove && (
                            <TableCell align={'right'}>
                              <Cell>
                                <IconButton
                                  aria-label="Remove"
                                  size="small"
                                  disabled={disableExecutor || addingMember || removingMember}
                                  className={styles.iconButtonNegative}
                                  onClick={() => onRemove(m)}
                                >
                                  <RemoveIcon />
                                </IconButton>
                              </Cell>
                            </TableCell>
                          )}
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
        <Filter data={availableMembers} limitKeys={['displayName']}>
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
                        <AvailableMembersFragment
                          availableMembers={availableMembers}
                          filteredMembers={filteredData}
                          loading={loadingAvailableMembers}
                          onAdd={onAdd}
                          addingMember={addingMember}
                          removingMember={removingMember}
                        />
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

interface AvailableMembersProps extends Pick<EditMembersProps, 'onAdd' | 'addingMember' | 'removingMember'> {
  filteredMembers?: UserDisplayNameFragment[];
  availableMembers?: UserDisplayNameFragment[];
  loading: boolean;
}

const AvailableMembersFragment: FC<AvailableMembersProps> = ({
  filteredMembers = [],
  availableMembers = [],
  loading,
  onAdd,
  addingMember,
  removingMember,
}) => {
  const styles = useStyles();
  const { t } = useTranslation();

  const membersData = useMemo<Member[]>(
    () => (loading ? new Array(3).fill({}) : filteredMembers),
    [loading, filteredMembers]
  );
  const Cell = useMemo(() => (loading ? Skeleton : React.Fragment), [loading]);

  if (availableMembers.length === 0) {
    return (
      <TableRow className={styles.trow}>
        <TableCell colSpan={2}>
          <Typography>{t('components.edit-members.no-available-members')}</Typography>
        </TableCell>
      </TableRow>
    );
  }

  if (membersData.length === 0) {
    return (
      <TableRow className={styles.trow}>
        <TableCell colSpan={2}>
          <Typography>{t('components.edit-members.user-not-found')}</Typography>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {membersData.map((m, i) => (
        <TableRow key={i} className={styles.trow}>
          {onAdd && (
            <TableCell>
              <Cell>
                <IconButton
                  aria-label="Add"
                  size="small"
                  onClick={() => onAdd(m)}
                  className={styles.iconButtonSuccess}
                  disabled={addingMember || removingMember}
                >
                  <AddIcon />
                </IconButton>
              </Cell>
            </TableCell>
          )}
          <TableCell>
            <Cell>{m.displayName}</Cell>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

export default EditMembers;
