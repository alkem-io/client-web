import { Member } from '@/domain/community/user/models/UserModel';
import { Box, Typography } from '@mui/material';
import TableCell from '@mui/material/TableCell';
import { FC } from 'react';
import { AvailableMembers, EditMembers } from './EditMembers';
import { TabPanel } from '@/domain/common/layout/TabPanel';
import PageContent from '@/core/ui/content/PageContent';
import PageContentColumn from '@/core/ui/content/PageContentColumn';

export interface EditMemberUsersProps {
  members: Member[];
  availableMembers: {
    id: string;
    profile: { displayName: string };
    email?: string;
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
  isRemoveDisabled?: boolean;
}

export const EditMemberUsers: FC<EditMemberUsersProps> = ({
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
  isRemoveDisabled = false,
}) => {
  return (
    <>
      {title && (
        <Box component={Typography} paddingBottom={1} variant="h3">
          {title}
        </Box>
      )}
      <TabPanel value={0} index={0}>
        <PageContent>
          <PageContentColumn columns={8}>
            Group members:
            <EditMembers
              members={members}
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
              isRemoveDisabled={isRemoveDisabled}
            />
          </PageContentColumn>

          <PageContentColumn columns={4}>
            Available users:
            <AvailableMembers
              onAdd={onAdd}
              fetchMore={fetchMore}
              hasMore={hasMore}
              onSearchTermChange={onSearchTermChange}
              filteredMembers={availableMembers}
              loading={loadingAvailableMembers}
              updating={updating}
              header={<TableCell>Full Name (email)</TableCell>}
              renderRow={m => (
                <TableCell>{m.email ? `${m.profile.displayName} (${m.email})` : m.profile.displayName}</TableCell>
              )}
              renderEmptyRow={Cell => (
                <TableCell>
                  <Cell />
                </TableCell>
              )}
            />
          </PageContentColumn>
        </PageContent>
      </TabPanel>
    </>
  );
};

export default EditMemberUsers;
