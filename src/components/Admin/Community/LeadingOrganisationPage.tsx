import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import { makeStyles } from '@material-ui/core';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useUpdateNavigation, useUrlParams } from '../../../hooks';
import { PageProps } from '../../../pages';
import {
  refetchChallengeLeadOrganisationsQuery,
  useChallengeLeadOrganisationsQuery,
  useChallengeNameQuery,
  useUpdateChallengeMutation,
} from '../../../hooks/generated/graphql';
import { useApolloErrorHandler } from '../../../hooks';
import { OrganisationDetailsFragment, UpdateChallengeInput } from '../../../models/graphql-schema';
import Avatar from '../../core/Avatar';

const useStyles = makeStyles(theme => ({
  iconButtonSuccess: {
    color: theme.palette.success.main,
  },
  iconButtonNegative: {
    color: theme.palette.negative.main,
  },
}));

interface LeadingOrganisationPageProps extends PageProps {}

const LeadingOrganisationPage: FC<LeadingOrganisationPageProps> = ({ paths }) => {
  const currentPaths = useMemo(() => [...paths, { name: 'lead', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  const handleError = useApolloErrorHandler();

  const { ecoverseId, challengeId: challengeNameId } = useUrlParams();

  const { data: _challenge } = useChallengeNameQuery({
    variables: { ecoverseId: ecoverseId, challengeId: challengeNameId },
  });
  const challengeId = _challenge?.ecoverse?.challenge.id || '';

  const { data: _leadingOrganisations } = useChallengeLeadOrganisationsQuery({
    variables: { ecoverseId: ecoverseId, challengeID: challengeNameId },
  });
  const leadingOrganisations = (_leadingOrganisations?.ecoverse.challenge.leadOrganisations ||
    []) as OrganisationDetailsFragment[];
  const organisations = (_leadingOrganisations?.organisations || []) as OrganisationDetailsFragment[];

  const available = useMemo(
    () => organisations.filter(x => !leadingOrganisations.find(y => y.id === x.id)),
    [organisations, leadingOrganisations]
  );

  const [updateChallenge, { loading: isUpdating }] = useUpdateChallengeMutation({
    onError: handleError,
    refetchQueries: [refetchChallengeLeadOrganisationsQuery({ ecoverseId: ecoverseId, challengeID: challengeId })],
    awaitRefetchQueries: true,
  });

  const handleAdd = (orgId: string) => {
    const newLeading = [...leadingOrganisations.map(x => x.id), orgId];
    _updateChallenge({
      ID: challengeId,
      leadOrganisations: newLeading,
    });
  };

  const handleRemove = (orgId: string) => {
    const orgToRemoveIndex = leadingOrganisations.findIndex(x => x.id === orgId);

    if (orgToRemoveIndex > -1) {
      const newLeading = [...leadingOrganisations].map(x => x.id);
      newLeading.splice(orgToRemoveIndex, 1);

      _updateChallenge({
        ID: challengeId,
        leadOrganisations: newLeading,
      });
    }
  };

  const _updateChallenge = (input: UpdateChallengeInput) => {
    updateChallenge({
      variables: {
        input: {
          ID: input.ID,
          leadOrganisations: input.leadOrganisations,
        },
      },
    });
  };

  return (
    <EditLeadingOrganisation
      available={toOrganisationDetailsVm(available)}
      leading={toOrganisationDetailsVm(leadingOrganisations)}
      onAdd={handleAdd}
      onRemove={handleRemove}
      isUpdating={isUpdating}
    />
  );
};

interface OrganisationDetailsVm {
  id: string;
  avatarSrc: string;
  name: string;
  tags?: string;
}

const toOrganisationDetailsVm = (prop: OrganisationDetailsFragment[]) => {
  return prop.map(
    x =>
      ({
        id: x.id,
        avatarSrc: x.profile.avatar,
        name: x.displayName,
        tags: (x.profile?.tagsets || []).flatMap(y => y.tags).join(','),
      } as OrganisationDetailsVm)
  );
};

interface EditLeadingOrganisationProps {
  leading: OrganisationDetailsVm[];
  available: OrganisationDetailsVm[];
  onAdd: (orgId: string) => void;
  onRemove: (orgId: string) => void;
  isUpdating: boolean;
}

const EditLeadingOrganisation: FC<EditLeadingOrganisationProps> = ({
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
export default LeadingOrganisationPage;

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
