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
import { useUpdateNavigation, useUrlParams } from '../../../hooks';
import { PageProps } from '../../../pages';
import {
  refetchChallengeLeadOrganizationsQuery,
  useChallengeLeadOrganizationsQuery,
  useChallengeNameQuery,
  useUpdateChallengeMutation,
} from '../../../hooks/generated/graphql';
import { useApolloErrorHandler } from '../../../hooks';
import { OrganizationDetailsFragment, UpdateChallengeInput } from '../../../models/graphql-schema';
import Avatar from '../../core/Avatar';

const useStyles = makeStyles(theme => ({
  iconButtonSuccess: {
    color: theme.palette.success.main,
  },
  iconButtonNegative: {
    color: theme.palette.negative.main,
  },
}));

interface LeadingOrganizationPageProps extends PageProps {}

const LeadingOrganizationPage: FC<LeadingOrganizationPageProps> = ({ paths }) => {
  const currentPaths = useMemo(() => [...paths, { name: 'lead', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  const handleError = useApolloErrorHandler();

  const { ecoverseNameId, challengeNameId } = useUrlParams();

  const { data: _challenge } = useChallengeNameQuery({
    variables: { ecoverseId: ecoverseNameId, challengeId: challengeNameId },
  });
  const challengeId = _challenge?.ecoverse?.challenge.id || '';

  const { data: _leadingOrganizations } = useChallengeLeadOrganizationsQuery({
    variables: { ecoverseId: ecoverseNameId, challengeID: challengeNameId },
  });
  const leadingOrganizations = (_leadingOrganizations?.ecoverse.challenge.leadOrganizations ||
    []) as OrganizationDetailsFragment[];
  const organizations = (_leadingOrganizations?.organizations || []) as OrganizationDetailsFragment[];

  const available = useMemo(
    () => organizations.filter(x => !leadingOrganizations.find(y => y.id === x.id)),
    [organizations, leadingOrganizations]
  );

  const [updateChallenge, { loading: isUpdating }] = useUpdateChallengeMutation({
    onError: handleError,
    refetchQueries: [refetchChallengeLeadOrganizationsQuery({ ecoverseId: ecoverseNameId, challengeID: challengeId })],
    awaitRefetchQueries: true,
  });

  const handleAdd = (orgId: string) => {
    const newLeading = [...leadingOrganizations.map(x => x.id), orgId];
    _updateChallenge({
      ID: challengeId,
      leadOrganizations: newLeading,
    });
  };

  const handleRemove = (orgId: string) => {
    const orgToRemoveIndex = leadingOrganizations.findIndex(x => x.id === orgId);

    if (orgToRemoveIndex > -1) {
      const newLeading = [...leadingOrganizations].map(x => x.id);
      newLeading.splice(orgToRemoveIndex, 1);

      _updateChallenge({
        ID: challengeId,
        leadOrganizations: newLeading,
      });
    }
  };

  const _updateChallenge = (input: UpdateChallengeInput) => {
    updateChallenge({
      variables: {
        input: {
          ID: input.ID,
          leadOrganizations: input.leadOrganizations,
        },
      },
    });
  };

  return (
    <EditLeadingOrganization
      available={toOrganizationDetailsVm(available)}
      leading={toOrganizationDetailsVm(leadingOrganizations)}
      onAdd={handleAdd}
      onRemove={handleRemove}
      isUpdating={isUpdating}
    />
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
        avatarSrc: x.profile.avatar,
        name: x.displayName,
        tags: (x.profile?.tagsets || []).flatMap(y => y.tags).join(','),
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
        <div style={{ height: 400 }}>
          <DataGrid
            rows={leading}
            columns={leadingColumns(t, styles, onRemove)}
            density="compact"
            hideFooter={true}
            loading={isUpdating}
          />
        </div>
      </Grid>
      <Grid item xs={6}>
        <div style={{ height: 400 }}>
          <DataGrid
            rows={available}
            columns={availableColumns(t, styles, onAdd)}
            density="compact"
            hideFooter={true}
            loading={isUpdating}
          />
        </div>
      </Grid>
    </Grid>
  );
};
export default LeadingOrganizationPage;

const leadingColumns = (t: TFunction, styles: ClassNameMap<string>, onRemove: (orgId: string) => void) =>
  [
    {
      field: 'avatarSrc',
      headerName: t('common.avatar'),
      width: 130,
      filterable: false,
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
      filterable: false,
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
      filterable: false,
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
      filterable: false,
      headerName: t('common.avatar'),
      width: 130,
      renderCell: params => <Avatar src={params.value as string} />,
    },
    { field: 'name', headerName: t('common.name'), flex: 1 },
  ] as GridColDef[];
