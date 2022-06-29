import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Grid from '@mui/material/Grid';
import { OrganizationDetailsFragment } from '../../../../models/graphql-schema';
import Avatar from '../../../../components/core/Avatar';
import DashboardGenericSection from '../../../shared/components/DashboardSections/DashboardGenericSection';
import EditMembers, { AvailableMembers } from '../../../../components/Admin/Community/EditMembers';
import { TableCell } from '@mui/material';

interface AdminCommunityOrganizationsViewProps extends Omit<EditOrganizationsProps, 'available' | 'existing'> {
  headerText: string;
  existingOrganizations: OrganizationDetailsFragment[];
  availableOrganizations: OrganizationDetailsFragment[];
}

const AdminCommunityOrganizationsView = ({
  headerText,
  existingOrganizations,
  availableOrganizations,
  ...editViewProps
}: AdminCommunityOrganizationsViewProps) => {
  return (
    <DashboardGenericSection headerText={headerText}>
      <EditOrganizations
        available={toOrganizationDetailsVm(availableOrganizations)}
        existing={toOrganizationDetailsVm(existingOrganizations)}
        {...editViewProps}
      />
    </DashboardGenericSection>
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
}

const EditOrganizations: FC<EditOrganizationsProps> = ({
  existing,
  available,
  onAdd,
  onRemove,
  updating = false,
  fetchMore,
  hasMore = false,
  loading,
  onSearchTermChange,
}) => {
  // const styles = useStyles();
  const { t } = useTranslation();

  return (
    <Grid container spacing={2}>
      <EditMembers
        members={existing}
        addingMember={updating}
        removingMember={updating}
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
      <AvailableMembers
        onAdd={onAdd}
        fetchMore={fetchMore}
        hasMore={hasMore}
        onSearchTermChange={onSearchTermChange}
        filteredMembers={available}
        loading={loading}
        addingMember={updating}
        removingMember={updating}
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
    </Grid>
  );
};

export default AdminCommunityOrganizationsView;
