import { Member } from '@/domain/community/user/models/User';
import { Box, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import TableCell from '@mui/material/TableCell';
import { FC } from 'react';
import { AvailableMembers, EditMembers } from './EditMembers';

export interface EditMemberUsersProps {
  executorId?: string;
  members: Member[];
  availableMembers: {
    id: string;
    profile: { displayName: string };
  }[];
  updating?: boolean;
  loadingAvailableMembers?: boolean;
  loadingMembers?: boolean;
  onAdd: (memberId: string) => void;
  onRemove: (memberId: string) => void;
  fetchMore?: (amount?: number) => Promise<unknown>;
  onSearchTermChange: (term: string) => void;
  hasMore?: boolean;
  title?: string;
}

export const EditMemberUsers: FC<EditMemberUsersProps> = ({
  executorId,
  members,
  availableMembers,
  updating = false,
  loadingAvailableMembers = false,
  loadingMembers = false,
  onAdd = () => {},
  onRemove = () => {},
  fetchMore = () => Promise.resolve(),
  onSearchTermChange,
  hasMore = false,
  title,
}) => {
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
          <EditMembers
            members={members}
            updating={updating}
            loading={loadingMembers}
            onRemove={onRemove}
            header={
              <>
                <TableCell>Full Name</TableCell>
                <TableCell>First Name</TableCell>
                <TableCell>Last Name</TableCell>
                <TableCell>Email</TableCell>
              </>
            }
            renderRow={(m, Cell) => (
              <>
                <TableCell>
                  <Cell>{m.profile.displayName}</Cell>
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
              </>
            )}
            renderEmptyRow={Cell => (
              <>
                <TableCell>
                  <Cell />
                </TableCell>
                <TableCell>
                  <Cell />
                </TableCell>
                <TableCell>
                  <Cell />
                </TableCell>
                <TableCell>
                  <Cell />
                </TableCell>
              </>
            )}
            isRemoveDisabled={m => m.id === executorId}
          />
        </Grid>

        <Grid item sm={4}>
          Available users:
          <AvailableMembers
            onAdd={onAdd!}
            fetchMore={fetchMore}
            hasMore={hasMore}
            onSearchTermChange={onSearchTermChange}
            filteredMembers={availableMembers}
            loading={loadingAvailableMembers}
            updating={updating}
            header={<TableCell>Full Name</TableCell>}
            renderRow={m => <TableCell>{m.profile.displayName}</TableCell>}
            renderEmptyRow={Cell => (
              <TableCell>
                <Cell />
              </TableCell>
            )}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default EditMemberUsers;
