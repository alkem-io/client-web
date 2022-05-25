import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import makeStyles from '@mui/styles/makeStyles';
import { ClassNameMap } from '@mui/styles';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useUrlParams } from '../../../../hooks';
import {
  refetchChallengeLeadOrganizationsQuery,
  useChallengeLeadOrganizationsQuery,
  useChallengeNameQuery,
  useAssignOrganizationAsCommunityLeadMutation,
  useRemoveOrganizationAsCommunityLeadMutation,
} from '../../../../hooks/generated/graphql';
import { useApolloErrorHandler } from '../../../../hooks';
import { OrganizationDetailsFragment } from '../../../../models/graphql-schema';
import Avatar from '../../../../components/core/Avatar';
import { Filter } from '../../../../components/Admin/Common/Filter';
import DashboardGenericSection from '../../../../components/composite/common/sections/DashboardGenericSection';

const useStyles = makeStyles(theme => ({
  iconButtonSuccess: {
    color: theme.palette.success.main,
  },
  iconButtonNegative: {
    color: theme.palette.negative.main,
  },
  gridContainer: {
    height: 400,
    paddingTop: theme.spacing(1),
  },
}));

const LeadingOrganizationView: FC = () => {
  const handleError = useApolloErrorHandler();

  const { hubNameId = '', challengeNameId = '' } = useUrlParams();

  const { data: _challenge } = useChallengeNameQuery({
    variables: { hubId: hubNameId, challengeId: challengeNameId },
  });

  const challengeId = _challenge?.hub?.challenge.id || '';
  const communityId = _challenge?.hub?.challenge.community?.id;

  const { data: _leadingOrganizations } = useChallengeLeadOrganizationsQuery({
    variables: { hubId: hubNameId, challengeID: challengeNameId },
  });
  const leadingOrganizations = (_leadingOrganizations?.hub.challenge?.community?.leadOrganizations ||
    []) as OrganizationDetailsFragment[];
  const organizations = (_leadingOrganizations?.organizations || []) as OrganizationDetailsFragment[];

  const available = useMemo(
    () => organizations.filter(x => !leadingOrganizations.find(y => y.id === x.id)),
    [organizations, leadingOrganizations]
  );

  const [assignOrganizationAsCommunityLead, { loading: isUpdatingChallenge }] =
    useAssignOrganizationAsCommunityLeadMutation({
      onError: handleError,
      refetchQueries: [refetchChallengeLeadOrganizationsQuery({ hubId: hubNameId, challengeID: challengeId })],
      awaitRefetchQueries: true,
    });

  const [removeOrganizationAsCommunityLead, { loading: isRemovingOrganization }] =
    useRemoveOrganizationAsCommunityLeadMutation({
      onError: handleError,
      refetchQueries: [refetchChallengeLeadOrganizationsQuery({ hubId: hubNameId, challengeID: challengeId })],
      awaitRefetchQueries: true,
    });

  const isUpdating = isUpdatingChallenge || isRemovingOrganization;

  const handleAdd = (organizationID: string) => {
    if (!communityId) {
      throw new TypeError("Community isn't yet loaded.");
    }
    assignOrganizationAsCommunityLead({
      variables: {
        leadershipData: {
          communityID: communityId,
          organizationID,
        },
      },
    });
  };

  const handleRemove = (organizationID: string) => {
    if (!communityId) {
      throw new TypeError("Community isn't yet loaded.");
    }
    removeOrganizationAsCommunityLead({
      variables: {
        leadershipData: {
          communityID: communityId,
          organizationID,
        },
      },
    });
  };

  const { t } = useTranslation();

  return (
    <DashboardGenericSection headerText={t('pages.generic.sections.dashboard.leading-organizations')}>
      <EditLeadingOrganization
        available={toOrganizationDetailsVm(available)}
        leading={toOrganizationDetailsVm(leadingOrganizations)}
        onAdd={handleAdd}
        onRemove={handleRemove}
        isUpdating={isUpdating}
      />
    </DashboardGenericSection>
  );
};

interface OrganizationDetailsVm {
  id: string;
  avatarSrc: string;
  name: string;
  tags?: string;
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

interface EditLeadingOrganizationProps {
  leading: OrganizationDetailsVm[];
  available: OrganizationDetailsVm[];
  onAdd: (orgId: string) => void;
  onRemove: (orgId: string) => void;
  isUpdating: boolean;
}

const EditLeadingOrganization: FC<EditLeadingOrganizationProps> = ({
  leading,
  available,
  onAdd,
  onRemove,
  isUpdating = false,
}) => {
  const styles = useStyles();
  const { t } = useTranslation();
  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <Filter
          data={leading}
          placeholder={t('pages.lead-organization.search.leading-placeholder')}
          limitKeys={['name', 'tags']}
        >
          {filteredData => (
            <div className={styles.gridContainer}>
              <DataGrid
                rows={filteredData}
                columns={leadingColumns(t, styles, onRemove)}
                density="compact"
                hideFooter={true}
                loading={isUpdating}
                disableColumnFilter={true}
              />
            </div>
          )}
        </Filter>
      </Grid>
      <Grid item xs={6}>
        <Filter
          data={available}
          placeholder={t('pages.lead-organization.search.available-placeholder')}
          limitKeys={['name']}
        >
          {filteredData => (
            <div className={styles.gridContainer}>
              <DataGrid
                rows={filteredData}
                columns={availableColumns(t, styles, onAdd)}
                density="compact"
                hideFooter={true}
                loading={isUpdating}
                disableColumnFilter={true}
              />
            </div>
          )}
        </Filter>
      </Grid>
    </Grid>
  );
};
export default LeadingOrganizationView;

const leadingColumns = (t: TFunction, styles: ClassNameMap<string>, onRemove: (orgId: string) => void) =>
  [
    {
      field: 'avatarSrc',
      headerName: t('common.avatar'),
      width: 130,
      renderCell: params => <Avatar src={params.value as string} />,
    },
    { field: 'name', headerName: 'Name', flex: 1 },
    {
      field: 'tags',
      headerName: t('common.tags'),
      flex: 1,
    },
    {
      field: 'id',
      width: 140,
      headerName: t('common.remove'),
      renderCell: params => (
        <IconButton
          aria-label="Remove"
          className={styles.iconButtonNegative}
          size="small"
          onClick={() => onRemove(params.value as string)}
        >
          <RemoveIcon />
        </IconButton>
      ),
      align: 'right',
    },
  ] as GridColDef[];

const availableColumns = (t: TFunction, styles: ClassNameMap<string>, onAdd: (orgId: string) => void) =>
  [
    {
      field: 'id',
      width: 110,
      headerName: t('common.add'),
      renderCell: params => (
        <IconButton
          aria-label="Add"
          className={styles.iconButtonSuccess}
          size="small"
          onClick={() => onAdd(params.value as string)}
        >
          <AddIcon />
        </IconButton>
      ),
    },
    {
      field: 'avatarSrc',
      headerName: t('common.avatar'),
      width: 130,
      renderCell: params => <Avatar src={params.value as string} />,
    },
    { field: 'name', headerName: t('common.name'), flex: 1 },
  ] as GridColDef[];
