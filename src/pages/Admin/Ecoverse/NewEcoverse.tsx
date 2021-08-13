import React, { FC, useMemo } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { Box, Container } from '@material-ui/core';
import EcoverseEditForm, { EcoverseEditFormValuesType } from '../../../components/Admin/EcoverseEditForm';
import Button from '../../../components/core/Button';
import Typography from '../../../components/core/Typography';
import {
  EcoverseDetailsFragmentDoc,
  useCreateEcoverseMutation,
  useOrganizationsListQuery,
} from '../../../hooks/generated/graphql';
import { useApolloErrorHandler } from '../../../hooks';
import { useUpdateNavigation } from '../../../hooks';
import { useNotification } from '../../../hooks';
import { PageProps } from '../../common';
import { createContextInput } from '../../../utils/buildContext';
import { useTranslation } from 'react-i18next';

interface NewEcoverseProps extends PageProps {}

export const NewEcoverse: FC<NewEcoverseProps> = ({ paths }) => {
  const { t } = useTranslation();
  const currentPaths = useMemo(() => [...paths, { value: '', name: 'new', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });
  const history = useHistory();
  const { url } = useRouteMatch();
  const notify = useNotification();
  const handleError = useApolloErrorHandler();
  const { data: organizationList, loading: loadingOrganizations } = useOrganizationsListQuery();

  const [createEcoverse, { loading: loading1 }] = useCreateEcoverseMutation({
    // refetchQueries: [refetchEcoversesQuery()],
    // awaitRefetchQueries: true,
    onCompleted: data => {
      const ecoverseId = data.createEcoverse.nameID;
      if (ecoverseId) {
        notify('Ecoverse created successfuly!', 'success');
        const newEcoverseUrl = url.replace('/new', `/${ecoverseId}/edit`);
        history.replace(newEcoverseUrl);
      }
    },
    update: (cache, { data }) => {
      if (data) {
        const { createEcoverse } = data;

        cache.modify({
          fields: {
            ecoverses(existingEcoverses = []) {
              const newEcoverseRef = cache.writeFragment({
                data: createEcoverse,
                fragment: EcoverseDetailsFragmentDoc,
                fragmentName: 'EcoverseDetails',
              });
              return [...existingEcoverses, newEcoverseRef];
            },
          },
        });
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
    const { name, nameID, host, tagsets } = values;

    await createEcoverse({
      variables: {
        input: {
          nameID,
          hostID: host,
          context: createContextInput(values),
          displayName: name,
          tags: tagsets.map(x => x.tags.join()),
        },
      },
    });
  };

  let submitWired;
  return (
    <Container maxWidth="xl">
      <Box marginY={3}>
        <Typography variant={'h2'}>{'New Ecoverse'}</Typography>
      </Box>
      <EcoverseEditForm
        isEdit={false}
        onSubmit={onSubmit}
        wireSubmit={submit => (submitWired = submit)}
        organizations={organizations}
      />
      <Box display={'flex'} marginY={4} justifyContent={'flex-end'}>
        <Button
          disabled={isLoading}
          variant="primary"
          onClick={() => submitWired()}
          text={t(`buttons.${isLoading ? 'processing' : 'save'}`)}
        />
      </Box>
    </Container>
  );
};
export default NewEcoverse;
