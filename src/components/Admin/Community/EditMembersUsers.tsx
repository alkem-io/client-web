import Grid from '@mui/material/Grid';
import TableCell from '@mui/material/TableCell';
import React, { FC } from 'react';
import { Member } from '../../../models/User';
import { UserDisplayNameFragment } from '../../../models/graphql-schema';
import { AvailableMembers, EditMembers } from './EditMembers';
import { Box, Typography } from '@mui/material';

export interface EditMemberUsersProps {
  executorId?: string;
  members: Member[];
  availableMembers: UserDisplayNameFragment[];
  addingMember?: boolean; // TODO make required
  removingMember?: boolean; // TODO make required
  loadingAvailableMembers?: boolean;
  loadingMembers?: boolean;
  onAdd: (memberId: string) => void;
  onRemove: (memberId: string) => void;
  fetchMore?: (amount?: number) => Promise<void>;
  onSearchTermChange: (term: string) => void;
  hasMore?: boolean;
  title?: string;
}

export const EditMemberUsers: FC<EditMemberUsersProps> = ({
  executorId,
  members,
  availableMembers,
  addingMember = false,
  removingMember = false,
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
            updating={addingMember || removingMember}
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
            updating={addingMember || removingMember}
            header={<TableCell>Full Name</TableCell>}
            renderRow={m => <TableCell>{m.displayName}</TableCell>}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default EditMemberUsers;
