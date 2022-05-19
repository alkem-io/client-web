import debounce from 'lodash/debounce';
import { Box, TextField, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
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
import TableRowLoading from '../../../domain/shared/pagination/TableRowLoading';
import useLazyLoading from '../../../domain/shared/pagination/useLazyLoading';
import { times } from 'lodash';
import { Identifiable } from '../../../domain/shared/types/Identifiable';

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  background: theme.palette.divider,
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const StyledButtonAdd = styled(IconButton)(({ theme }) => ({
  color: theme.palette.success.main,
}));

const StyledButtonRemove = styled(IconButton)(({ theme }) => ({
  color: theme.palette.negative.main,
}));

const initEmptyMembers = <T extends Identifiable>() => times(3, i => ({ id: `__loading_${i}` } as T));

const TABLE_HEIGHT = 600;
const FILTER_DEBOUNCE = 500;

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
  fetchMore?: (amount?: number) => Promise<void>;
  onFilter?: (term: string) => any;
  hasMore?: boolean;
  title?: string;
}

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
  fetchMore = () => Promise.resolve(),
  onFilter,
  hasMore = false,
  title,
}) => {
  const { t } = useTranslation();
  const membersData = useMemo<Member[]>(
    () => (loadingMembers ? initEmptyMembers() : members),
    [loadingMembers, members]
  );
  const Cell = useMemo(() => (loadingMembers ? Skeleton : React.Fragment), [loadingMembers]);

  const handleFilter = useMemo(
    () => debounce((e: React.ChangeEvent<HTMLInputElement>) => onFilter?.(e.target.value), FILTER_DEBOUNCE),
    [onFilter, FILTER_DEBOUNCE]
  );

  const lazyLoading = useLazyLoading({
    fetchMore,
    loading: loadingAvailableMembers,
  });

  return (
    <>
      {title && (
        <Box component={Typography} paddingBottom={1} variant="h3">
          {title}
        </Box>
      )}
      <Grid container spacing={2}>
        <Grid item xs={8}>
          Group members:
          <Filter data={membersData}>
            {filteredMembers => (
              <>
                <hr />
                <Box component={'div'} maxHeight={TABLE_HEIGHT} overflow={'auto'}>
                  <Table size="small">
                    <StyledTableHead>
                      <TableRow>
                        <TableCell>Full Name</TableCell>
                        <TableCell>First Name</TableCell>
                        <TableCell>Last Name</TableCell>
                        <TableCell>Email</TableCell>
                        {onRemove && <TableCell />}
                      </TableRow>
                    </StyledTableHead>
                    <TableBody>
                      {filteredMembers.map(m => {
                        const disableExecutor = m.id === executor?.id && !deleteExecutor;
                        return (
                          <StyledTableRow key={m.id}>
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
                                  <StyledButtonRemove
                                    aria-label="Remove"
                                    size="small"
                                    disabled={disableExecutor || addingMember || removingMember}
                                    onClick={() => onRemove(m)}
                                  >
                                    <RemoveIcon />
                                  </StyledButtonRemove>
                                </Cell>
                              </TableCell>
                            )}
                          </StyledTableRow>
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
          <TextField
            placeholder={t('components.filter.placeholder')}
            onChange={handleFilter}
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
            sx={{ background: theme => theme.palette.primary.contrastText }}
          />
          <>
            <hr />
            <Box component={'div'} maxHeight={TABLE_HEIGHT} overflow={'auto'}>
              <TableContainer>
                <Table size="small" style={{ position: 'relative' }}>
                  <StyledTableHead>
                    <TableRow>
                      <TableCell />
                      <TableCell>Full Name</TableCell>
                    </TableRow>
                  </StyledTableHead>
                  <TableBody>
                    <AvailableMembersFragment
                      availableMembers={availableMembers}
                      filteredMembers={availableMembers}
                      loading={loadingAvailableMembers}
                      onAdd={onAdd}
                      addingMember={addingMember}
                      removingMember={removingMember}
                    />
                    {hasMore && <TableRowLoading ref={lazyLoading.ref} colSpan={2} />}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </>
        </Grid>
      </Grid>
    </>
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
  const { t } = useTranslation();

  const membersData = useMemo<UserDisplayNameFragment[]>(
    () => (loading ? initEmptyMembers() : filteredMembers),
    [loading, filteredMembers]
  );
  const Cell = useMemo(() => (loading ? Skeleton : React.Fragment), [loading]);

  if (availableMembers.length === 0) {
    return (
      <StyledTableRow>
        <TableCell colSpan={2}>
          <Typography>{t('components.edit-members.no-available-members')}</Typography>
        </TableCell>
      </StyledTableRow>
    );
  }

  if (membersData.length === 0) {
    return (
      <StyledTableRow>
        <TableCell colSpan={2}>
          <Typography>{t('components.edit-members.user-not-found')}</Typography>
        </TableCell>
      </StyledTableRow>
    );
  }

  return (
    <>
      {membersData.map(m => (
        <StyledTableRow key={m.id}>
          {onAdd && (
            <TableCell>
              <Cell>
                <StyledButtonAdd
                  aria-label="Add"
                  size="small"
                  onClick={() => onAdd(m)}
                  disabled={addingMember || removingMember}
                >
                  <AddIcon />
                </StyledButtonAdd>
              </Cell>
            </TableCell>
          )}
          <TableCell>
            <Cell>{m.displayName}</Cell>
          </TableCell>
        </StyledTableRow>
      ))}
    </>
  );
};

export default EditMembers;
