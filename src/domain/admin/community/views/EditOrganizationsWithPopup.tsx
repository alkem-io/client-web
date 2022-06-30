import React, { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { OrganizationDetailsFragment } from '../../../../models/graphql-schema';
import Avatar from '../../../../components/core/Avatar';
import EditMembers, { AvailableMembers } from '../../../../components/Admin/Community/EditMembers';
import { Box, Button, Dialog, DialogContent, TableCell } from '@mui/material';
import Heading from '../../../shared/components/Heading';
import { SectionSpacer } from '../../../shared/components/Section/Section';

interface AdminCommunityOrganizationsViewProps
  extends Omit<EditOrganizationsProps, 'available' | 'existing' | 'entityName'> {
  existingOrganizations: OrganizationDetailsFragment[];
  availableOrganizations: OrganizationDetailsFragment[];
}

const EditOrganizationsWithPopup = ({
  existingOrganizations,
  availableOrganizations,
  ...editViewProps
}: AdminCommunityOrganizationsViewProps) => {
  const { t } = useTranslation();

  return (
    <EditOrganizationsWithPopupForVm
      available={useMemo(() => toOrganizationDetailsVm(availableOrganizations), [availableOrganizations])}
      existing={useMemo(() => toOrganizationDetailsVm(existingOrganizations), [existingOrganizations])}
      {...editViewProps}
      entityName={t('common.organizations')}
    />
  );
};

interface OrganizationDetailsVm {
  id: string;
  avatarSrc: string;
  name: string;
}

const toOrganizationDetailsVm = (prop: OrganizationDetailsFragment[]) => {
  return prop.map(
    x =>
      ({
        id: x.id,
        avatarSrc: x.profile?.avatar?.uri ?? '',
        name: x.displayName,
        tags: (x.profile?.tagsets || []).flatMap(y => y.tags).join(', '),
      } as OrganizationDetailsVm)
  );
};

export interface EditOrganizationsProps {
  existing: OrganizationDetailsVm[];
  available: OrganizationDetailsVm[];
  onAdd: (orgId: string) => void;
  onRemove: (orgId: string) => void;
  updating: boolean;
  fetchMore: (amount?: number) => Promise<void>;
  onSearchTermChange: (term: string) => void;
  hasMore: boolean | undefined;
  loading: boolean;
  loadAvailableMembers: () => Promise<void>;
  entityName: string;
}

const EditOrganizationsWithPopupForVm: FC<EditOrganizationsProps> = ({
  existing,
  available,
  onAdd,
  onRemove,
  updating = false,
  fetchMore,
  hasMore = false,
  loading,
  onSearchTermChange,
  loadAvailableMembers,
  entityName,
}) => {
  const { t } = useTranslation();
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (isAdding) {
      loadAvailableMembers();
    }
  }, [isAdding]);

  return (
    <>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Heading sub>{entityName}</Heading>
        <Button size="small" variant="contained" onClick={() => setIsAdding(true)}>
          {t('common.add')}
        </Button>
      </Box>
      <EditMembers
        members={existing}
        updating={updating}
        loading={loading}
        onRemove={onRemove}
        header={
          <>
            <TableCell>{t('common.avatar')}</TableCell>
            <TableCell>{t('common.name')}</TableCell>
          </>
        }
        renderRow={(o, Cell) => (
          <>
            <TableCell>
              <Cell>
                <Avatar src={o.avatarSrc} />
              </Cell>
            </TableCell>
            <TableCell>
              <Cell>{o.name}</Cell>
            </TableCell>
          </>
        )}
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
            onAdd={onAdd}
            fetchMore={fetchMore}
            hasMore={hasMore}
            onSearchTermChange={onSearchTermChange}
            filteredMembers={available}
            loading={loading}
            updating={updating}
            header={
              <>
                <TableCell>{t('common.avatar')}</TableCell>
                <TableCell>{t('common.name')}</TableCell>
              </>
            }
            renderRow={(o, Cell) => (
              <>
                <TableCell>
                  <Cell>
                    <Avatar src={o.avatarSrc} />
                  </Cell>
                </TableCell>
                <TableCell>
                  <Cell>{o.name}</Cell>
                </TableCell>
              </>
            )}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditOrganizationsWithPopup;
