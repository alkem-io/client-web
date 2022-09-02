import TableCell from '@mui/material/TableCell';
import React, { FC, useEffect, useState } from 'react';
import { AvailableMembers, EditMembers } from './EditMembers';
import { Box, Button, Dialog, DialogContent } from '@mui/material';
import { EditMemberUsersProps } from './EditMembersUsers';
import { useTranslation } from 'react-i18next';
import Heading from '../../../shared/components/Heading';
import { SectionSpacer } from '../../../shared/components/Section/Section';
import { AvailableUserFragment } from '../../../../models/graphql-schema';

export interface EditMemberUsersWithPopupProps extends EditMemberUsersProps {
  availableMembers: AvailableUserFragment[];
  loadAvailableMembers: () => Promise<void>;
}

export const EditMemberUsersWithPopup: FC<EditMemberUsersWithPopupProps> = ({
  executorId,
  members,
  availableMembers,
  updating,
  loadingAvailableMembers = false,
  loadingMembers = false,
  onAdd = () => {},
  onRemove = () => {},
  fetchMore = () => Promise.resolve(),
  onSearchTermChange,
  hasMore = false,
  loadAvailableMembers,
}) => {
  const { t } = useTranslation();
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (isAdding) {
      loadAvailableMembers();
    }
  }, [isAdding]);

  const entityName = t('common.users');

  return (
    <>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Heading sub>{entityName}</Heading>
        <Button size="small" variant="contained" onClick={() => setIsAdding(true)}>
          {t('common.add')}
        </Button>
      </Box>
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
      <Dialog
        open={isAdding}
        onClose={() => setIsAdding(false)}
        PaperProps={{ sx: { backgroundColor: 'background.default', minWidth: theme => theme.spacing(60) } }}
      >
        <DialogContent>
          <Heading>{t('actions.add-entity', { entity: entityName })}</Heading>
          <SectionSpacer />
          <AvailableMembers
            onAdd={onAdd!}
            fetchMore={fetchMore}
            hasMore={hasMore}
            onSearchTermChange={onSearchTermChange}
            filteredMembers={availableMembers}
            loading={loadingAvailableMembers}
            updating={updating}
            header={
              <>
                <TableCell>Full Name</TableCell>
                <TableCell>Email</TableCell>
              </>
            }
            renderRow={m => (
              <>
                <TableCell>{m.displayName}</TableCell>
                <TableCell>{m.email}</TableCell>
              </>
            )}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditMemberUsersWithPopup;
