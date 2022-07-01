import debounce from 'lodash/debounce';
import { Skeleton, TableProps, TextField, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import React, { ComponentType, ReactNode, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Filter } from '../Common/Filter';
import TableRowLoading from '../../../domain/shared/pagination/TableRowLoading';
import useLazyLoading from '../../../domain/shared/pagination/useLazyLoading';
import { times } from 'lodash';
import { Identifiable } from '../../../domain/shared/types/Identifiable';

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  '& th': { background: theme.palette.divider },
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

const FILTER_DEBOUNCE = 500;

const ScrollableTable = (props: TableProps) => (
  <TableContainer sx={{ maxHeight: theme => theme.spacing(75) }}>
    <Table stickyHeader size="small" {...props} />
  </TableContainer>
);

interface CustomizedTable<Item> {
  header: ReactNode | (() => ReactNode);
  renderRow: (member: Item, Cell: ComponentType) => ReactNode;
}

export interface EditMembersProps<Member extends Identifiable> extends CustomizedTable<Member> {
  members: Member[];
  updating: boolean;
  loading: boolean;
  onRemove: (memberId: string) => void; // TODO check usages
  isRemoveDisabled?: (member: Member) => boolean;
}

export const EditMembers = <Member extends Identifiable>({
  members,
  updating,
  loading,
  onRemove,
  header,
  renderRow,
  isRemoveDisabled = () => false,
}: EditMembersProps<Member>) => {
  const membersData = useMemo<Member[]>(() => (loading ? initEmptyMembers() : members), [loading, members]);
  const Cell = useMemo(() => (loading ? Skeleton : React.Fragment), [loading]);

  const renderHeader = typeof header === 'function' ? header : () => header;

  return (
    <Filter data={membersData}>
      {filteredMembers => (
        <>
          <hr />
          <ScrollableTable>
            <StyledTableHead>
              <TableRow>
                {renderHeader()}
                {onRemove && <TableCell />}
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {filteredMembers.map(m => {
                return (
                  <StyledTableRow key={m.id}>
                    {renderRow(m, Cell)}
                    {onRemove && (
                      <TableCell align="right">
                        <Cell>
                          <StyledButtonRemove
                            aria-label="Remove"
                            size="small"
                            disabled={isRemoveDisabled(m) || updating}
                            onClick={() => onRemove(m.id)}
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
          </ScrollableTable>
        </>
      )}
    </Filter>
  );
};

interface AvailableMembersProps<Member extends Identifiable> extends CustomizedTable<Member> {
  onAdd: (memberId: string) => void;
  fetchMore: (amount?: number) => Promise<void>;
  hasMore: boolean;
  onSearchTermChange: (term: string) => void;
  filteredMembers: Member[];
  loading: boolean;
  updating: boolean;
}

export const AvailableMembers = <Member extends Identifiable>({
  filteredMembers,
  onAdd,
  onSearchTermChange,
  fetchMore,
  hasMore,
  loading,
  updating,
  header,
  renderRow,
}: AvailableMembersProps<Member>) => {
  const { t } = useTranslation();

  const renderHeader = typeof header === 'function' ? header : () => header;

  const [searchTerm, setSearchTerm] = useState('');

  const Cell = useMemo(() => (loading ? Skeleton : React.Fragment), [loading]);

  // TODO debounce upper
  // Rationale: search can also be local or debounced at the transport level. This view is too deep to care about it.
  // Debouncing here also limits how high can we raise the searchTerm state.
  const onSearchTermChangeDebounced = useMemo(
    () => debounce(onSearchTermChange, FILTER_DEBOUNCE),
    [onSearchTermChange, FILTER_DEBOUNCE]
  );

  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);

  useEffect(() => {
    onSearchTermChangeDebounced(searchTerm);
  }, [searchTerm]);

  const lazyLoading = useLazyLoading({
    fetchMore,
    loading,
  });

  return (
    <>
      <TextField
        value={searchTerm}
        placeholder={t('components.filter.placeholder')}
        onChange={handleSearchTermChange}
        size="small"
        fullWidth
        InputLabelProps={{ shrink: true }}
        sx={{ background: theme => theme.palette.primary.contrastText }}
      />
      <hr />
      <ScrollableTable>
        <StyledTableHead>
          <TableRow>
            <TableCell />
            {renderHeader()}
          </TableRow>
        </StyledTableHead>
        <TableBody>
          {filteredMembers.length === 0 && (
            <StyledTableRow>
              <TableCell colSpan={3}>
                <Typography>
                  {t(
                    searchTerm === ''
                      ? 'components.edit-members.no-available-members'
                      : 'components.edit-members.user-not-found'
                  )}
                </Typography>
              </TableCell>
            </StyledTableRow>
          )}
          {filteredMembers.map(m => (
            <StyledTableRow key={m.id}>
              {onAdd && (
                <TableCell>
                  <Cell>
                    <StyledButtonAdd aria-label="Add" size="small" onClick={() => onAdd(m.id)} disabled={updating}>
                      <AddIcon />
                    </StyledButtonAdd>
                  </Cell>
                </TableCell>
              )}
              {renderRow(m, Cell)}
            </StyledTableRow>
          ))}
          {hasMore && <TableRowLoading ref={lazyLoading.ref} colSpan={2} />}
        </TableBody>
      </ScrollableTable>
    </>
  );
};

export default EditMembers;
