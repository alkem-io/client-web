import React, { FC, useMemo } from 'react';
import { useParams } from 'react-router';
import { Button, Col, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { DataGrid, GridColDef } from '@material-ui/data-grid';
import { useUpdateNavigation } from '../../../hooks/useNavigation';
import { PageProps } from '../../../pages';
import {
  refetchChallengeLeadOrganisationsQuery,
  useChallengeLeadOrganisationsQuery,
  useChallengeNameQuery,
  useUpdateChallengeMutation,
} from '../../../generated/graphql';
import { useApolloErrorHandler } from '../../../hooks/useApolloErrorHandler';
import { OrganisationDetailsFragment, UpdateChallengeInput } from '../../../types/graphql-schema';
import Avatar from '../../core/Avatar';
import { TFunction } from 'i18next';

interface Params {
  ecoverseId: string;
  challengeId: string;
}

interface LeadingOrganisationPageProps extends PageProps {}

const LeadingOrganisationPage: FC<LeadingOrganisationPageProps> = ({ paths }) => {
  const currentPaths = useMemo(() => [...paths, { name: 'lead', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  const handleError = useApolloErrorHandler();

  const { ecoverseId, challengeId: challengeNameId } = useParams<Params>();

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

  const available = useMemo(() => organisations.filter(x => !leadingOrganisations.find(y => y.id === x.id)), [
    organisations,
    leadingOrganisations,
  ]);

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
  const { t } = useTranslation();
  return (
    <>
      <Row>
        <Col>
          <div style={{ height: 400 }}>
            <DataGrid
              rows={leading}
              columns={leadingColumns(t, onRemove)}
              density="compact"
              hideFooter={true}
              loading={isUpdating}
            />
          </div>
        </Col>
        <Col sm={5}>
          <div style={{ height: 400 }}>
            <DataGrid
              rows={available}
              columns={availableColumns(t, onAdd)}
              density="compact"
              hideFooter={true}
              loading={isUpdating}
            />
          </div>
        </Col>
      </Row>
    </>
  );
};
export default LeadingOrganisationPage;

const leadingColumns = (t: TFunction, onRemove: (orgId: string) => void) =>
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
        <Button variant="outline-danger" size="sm" onClick={() => onRemove(params.value as string)}>
          X
        </Button>
      ),
      align: 'right',
    },
  ] as GridColDef[];

const availableColumns = (t: TFunction, onAdd: (orgId: string) => void) =>
  [
    {
      field: 'id',
      width: 110,
      filterable: false,
      headerName: t('common.add'),
      renderCell: params => (
        <Button variant="outline-info" size="sm" onClick={() => onAdd(params.value as string)}>
          +
        </Button>
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
