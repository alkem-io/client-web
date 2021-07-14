import { PageProps } from '../../../pages';
import React, { FC, useMemo } from 'react';
import { useUpdateNavigation } from '../../../hooks/useNavigation';
import { Button, Col, Row, Table } from 'react-bootstrap';
import { Filter } from '../Common/Filter';
import {
  refetchChallengeLeadOrganisationsQuery,
  useChallengeLeadOrganisationsQuery,
  useChallengeNameQuery,
  useOrganisationsListInfoQuery,
  useUpdateChallengeMutation,
} from '../../../generated/graphql';
import { useParams } from 'react-router';
import { useApolloErrorHandler } from '../../../hooks/useApolloErrorHandler';
import { UpdateChallengeInput } from '../../../types/graphql-schema';
import Avatar from '../../core/Avatar';

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

  const { data: _organisations } = useOrganisationsListInfoQuery();
  const organisations = _organisations?.organisations || [];

  const { data: _leadingOrganisations } = useChallengeLeadOrganisationsQuery({
    variables: { ecoverseId: ecoverseId, challengeID: challengeNameId },
  });
  const leadingOrganisations = _leadingOrganisations?.ecoverse.challenge.leadOrganisations || [];

  const available = useMemo(() => organisations.filter(x => !leadingOrganisations.find(y => y.id === x.id)), [
    organisations,
    leadingOrganisations,
  ]);
  const leading = useMemo(() => organisations.filter(x => leadingOrganisations.find(y => y.id === x.id)), [
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

  // todo type
  return (
    <EditLeadingOrganisation
      available={available as any}
      leading={leading as any}
      onAdd={handleAdd}
      onRemove={handleRemove}
      isUpdating={isUpdating}
    />
  );
};

interface Type {
  id: string;
  displayName: string;
  profile: {
    id: string;
    avatar: string;
    tagsets: {
      tags: string[];
    }[];
  };
}

// todo type
interface EditLeadingOrganisationProps {
  leading: Type[];
  available: Type[];
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
  return (
    <>
      <Row>
        <Col>
          Leading organisations:
          <Filter data={leading}>
            {filteredData => (
              <>
                <hr />
                <div style={{ position: 'relative', height: 600, overflow: 'hidden', overflowY: 'auto' }}>
                  <Table hover size="sm" responsive="sm">
                    <thead className="thead-dark">
                      <tr>
                        <th>Avatar</th>
                        <th>Name</th>
                        <th>Tags</th>
                        <th>Remove</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map(x => (
                        <tr key={x.id}>
                          <td>
                            <Avatar size="md" src={x.profile.avatar} />
                          </td>
                          <td>{x.displayName}</td>
                          <td>{x.profile.tagsets.flatMap(y => y.tags).join(',')}</td>
                          <td className={'text-right'}>
                            <Button
                              disabled={isUpdating}
                              variant="outline-danger"
                              size="sm"
                              onClick={() => onRemove(x.id)}
                            >
                              X
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </>
            )}
          </Filter>
        </Col>
        <Col sm={4}>
          Available organisations:
          <Filter data={available}>
            {filteredData => (
              <>
                <hr />
                <div style={{ height: 600, overflow: 'hidden', overflowY: 'auto' }}>
                  <Table hover size="sm" responsive="sm" style={{ position: 'relative' }}>
                    <thead className="thead-dark">
                      <tr>
                        <th />
                        <th>Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map(x => (
                        <tr key={x.id}>
                          <td>
                            <Button disabled={isUpdating} variant="outline-info" size="sm" onClick={() => onAdd(x.id)}>
                              +
                            </Button>
                          </td>
                          <td>{x.displayName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </>
            )}
          </Filter>
        </Col>
      </Row>
    </>
  );
};
export default LeadingOrganisationPage;
