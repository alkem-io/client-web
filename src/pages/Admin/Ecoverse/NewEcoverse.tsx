import React, { FC, useMemo } from 'react';
import { Container } from 'react-bootstrap';
import { useHistory, useRouteMatch } from 'react-router-dom';
import EcoverseEditForm, { EcoverseEditFormValuesType } from '../../../components/Admin/EcoverseEditForm';
import Button from '../../../components/core/Button';
import { Loading } from '../../../components/core/Loading';
import Typography from '../../../components/core/Typography';

import {
  refetchEcoversesQuery,
  useCreateEcoverseMutation,
  useOrganizationsListQuery,
} from '../../../generated/graphql';
import { useApolloErrorHandler } from '../../../hooks/useApolloErrorHandler';
import { useUpdateNavigation } from '../../../hooks/useNavigation';
import { useNotification } from '../../../hooks/useNotification';
import { PageProps } from '../../common';

interface NewEcoverseProps extends PageProps {}

export const NewEcoverse: FC<NewEcoverseProps> = ({ paths }) => {
  const currentPaths = useMemo(() => [...paths, { value: '', name: 'new', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });
  const history = useHistory();
  const { url } = useRouteMatch();
  const notify = useNotification();
  const handleError = useApolloErrorHandler();
  const { data: organizationList, loading: loadingOrganizations } = useOrganizationsListQuery();

  const [createEcoverse, { loading: loading1 }] = useCreateEcoverseMutation({
    refetchQueries: [refetchEcoversesQuery()],
    awaitRefetchQueries: true,
    onCompleted: data => {
      const ecoverseId = data.createEcoverse.nameID;
      if (ecoverseId) {
        notify('Ecoverse created successfuly!', 'success');
        const newEcoverseUrl = url.replace('/new', `/${ecoverseId}/edit`);
        history.replace(newEcoverseUrl);
      }
    },
    onError: handleError,
  });

  const organizations = useMemo(
    () => organizationList?.organisations.map(e => ({ id: e.id, name: e.displayName })) || [],
    [organizationList]
  );

  const isLoading = loading1 || loadingOrganizations;

  const onSubmit = async (values: EcoverseEditFormValuesType) => {
    const { name, nameID, host, ...context } = values;
    await createEcoverse({
      variables: {
        input: { nameID, hostID: host, context, displayName: name },
      },
    });
  };

  let submitWired;
  return (
    <Container>
      <Typography variant={'h2'} className={'mt-4 mb-4'}>
        {'New Ecoverse'}
      </Typography>
      <EcoverseEditForm
        isEdit={false}
        onSubmit={onSubmit}
        wireSubmit={submit => (submitWired = submit)}
        organizations={organizations}
      />
      <div className={'d-flex mt-4 mb-4'}>
        <Button disabled={isLoading} className={'ml-auto'} variant="primary" onClick={() => submitWired()}>
          {isLoading ? <Loading text={'Processing'} /> : 'Save'}
        </Button>
      </div>
    </Container>
  );
};
export default NewEcoverse;
