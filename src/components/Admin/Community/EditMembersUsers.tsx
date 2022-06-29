import Grid from '@mui/material/Grid';
import TableCell from '@mui/material/TableCell';
import React, { FC } from 'react';
import { Member } from '../../../models/User';
import { UserDisplayNameFragment } from '../../../models/graphql-schema';
import { AvailableMembers, EditMembers } from './EditMembers';

export interface EditMemberUsersProps {
  executorId?: string;
  members: Member[];
  availableMembers: UserDisplayNameFragment[];
  addingMember?: boolean;
  removingMember?: boolean;
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
    <Grid container spacing={2}>
      <EditMembers
        title={title}
        members={members}
        addingMember={addingMember}
        removingMember={removingMember}
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
      <AvailableMembers
        onAdd={onAdd!}
        fetchMore={fetchMore}
        hasMore={hasMore}
        onSearchTermChange={onSearchTermChange}
        filteredMembers={availableMembers}
        loading={loadingAvailableMembers}
        addingMember={addingMember}
        removingMember={removingMember}
        header={<TableCell>Full Name</TableCell>}
        renderRow={m => <TableCell>{m.displayName}</TableCell>}
      />
    </Grid>
  );
};

export default EditMemberUsers;
