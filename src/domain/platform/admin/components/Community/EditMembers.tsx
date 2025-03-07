import { Identifiable } from '@/core/utils/Identifiable';
import TableRowLoading from '@/domain/shared/pagination/TableRowLoading';
import useLazyLoading from '@/domain/shared/pagination/useLazyLoading';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { Skeleton, TableProps, TextField, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { styled } from '@mui/material/styles';
import { times } from 'lodash';
import debounce from 'lodash/debounce';
import React, { ComponentType, PropsWithChildren, ReactNode, forwardRef, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Filter } from '../Common/Filter';

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

const FILTER_DEBOUNCE = 500;

const ScrollableTable = (props: TableProps) => (
  <TableContainer sx={{ maxHeight: theme => theme.spacing(75) }}>
    <Table stickyHeader size="small" {...props} />
  </TableContainer>
);

interface CustomizedTable<Item> {
  header: ReactNode | (() => ReactNode);
  renderRow: (member: Item, Cell: ComponentType<PropsWithChildren>) => ReactNode;
  renderEmptyRow?: (Cell: ComponentType) => ReactNode;
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
  renderEmptyRow,
  isRemoveDisabled = () => false,
}: EditMembersProps<Member>) => {
  const { t } = useTranslation();
  const Cell = useMemo(() => (loading ? Skeleton : React.Fragment), [loading]);

  const renderHeader = typeof header === 'function' ? header : () => header;
  return (
    <Filter data={members}>
      {filteredMembers => (
        <>
          <hr />
          <ScrollableTable>
            <StyledTableHead>
              <TableRow>
                {renderHeader()}
                {<TableCell />}
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {loading &&
                renderEmptyRow &&
                times(3, i => <StyledTableRow key={i}>{renderEmptyRow(Cell)}</StyledTableRow>)}
              {filteredMembers.map(m => {
                return (
                  <StyledTableRow key={m.id}>
                    {renderRow(m, Cell)}
                    {
                      <TableCell align="right">
                        <Cell>
                          <StyledButtonRemove
                            size="small"
                            disabled={isRemoveDisabled(m) || updating}
                            onClick={() => onRemove(m.id)}
                            aria-label={t('buttons.remove')}
                          >
                            <RemoveIcon />
                          </StyledButtonRemove>
                        </Cell>
                      </TableCell>
                    }
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
  fetchMore: (amount?: number) => Promise<unknown>;
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
  renderEmptyRow,
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
    [onSearchTermChange]
  );

  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);

  useEffect(() => {
    onSearchTermChangeDebounced(searchTerm);
  }, [searchTerm, onSearchTermChangeDebounced]);

  const columnsCount = React.Children.count(renderHeader()) + 1;

  const Loader = useMemo(
    () => forwardRef<HTMLTableRowElement>((props, ref) => <TableRowLoading ref={ref} colSpan={columnsCount} />),
    [columnsCount]
  );

  const loader = useLazyLoading(Loader, {
    hasMore,
    updating,
    loading,
    fetchMore,
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
          {!loading && filteredMembers.length === 0 && (
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
          {loading && renderEmptyRow && times(3, i => <StyledTableRow key={i}>{renderEmptyRow(Cell)}</StyledTableRow>)}
          {filteredMembers.map(m => (
            <StyledTableRow key={m.id}>
              {onAdd && (
                <TableCell>
                  <Cell>
                    <StyledButtonAdd
                      size="small"
                      onClick={() => onAdd(m.id)}
                      disabled={updating}
                      aria-label={t('common.add')}
                    >
                      <AddIcon />
                    </StyledButtonAdd>
                  </Cell>
                </TableCell>
              )}
              {renderRow(m, Cell)}
            </StyledTableRow>
          ))}
          {loader}
        </TableBody>
      </ScrollableTable>
    </>
  );
};
