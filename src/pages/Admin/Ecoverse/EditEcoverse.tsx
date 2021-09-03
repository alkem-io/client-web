import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import EcoverseEditForm, { EcoverseEditFormValuesType } from '../../../components/Admin/EcoverseEditForm';
import Button from '../../../components/core/Button';
import Typography from '../../../components/core/Typography';
import { useOrganizationsListQuery, useUpdateEcoverseMutation } from '../../../hooks/generated/graphql';
import { useApolloErrorHandler } from '../../../hooks';
import { useEcoverse } from '../../../hooks';
import { useUpdateNavigation } from '../../../hooks';
import { useNotification } from '../../../hooks';
import { PageProps } from '../../common';
import { updateContextInput } from '../../../utils/buildContext';
import { Box, Container } from '@material-ui/core';

interface EcoverseEditProps extends PageProps {}

export const EditEcoverse: FC<EcoverseEditProps> = ({ paths }) => {
  const { t } = useTranslation();
  const currentPaths = useMemo(() => [...paths, { value: '', name: 'edit', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });
  const { ecoverseId, ecoverse } = useEcoverse();
  const { data: organizationList, loading: loadingOrganizations } = useOrganizationsListQuery();
  const notify = useNotification();
  const handleError = useApolloErrorHandler();

  const [updateEcoverse, { loading: loading1 }] = useUpdateEcoverseMutation({
    onCompleted: () => onSuccess('Successfully updated'),
    onError: handleError,
  });

  const organizations = useMemo(
    () => organizationList?.organisations.map(e => ({ id: e.id, name: e.displayName })) || [],
    [organizationList]
  );

  const isLoading = loading1 || loadingOrganizations;
  const profile = ecoverse?.ecoverse;

  const onSuccess = (message: string) => {
    notify(message, 'success');
  };

  const onSubmit = async (values: EcoverseEditFormValuesType) => {
    const { name, host, tagsets, anonymousReadAccess } = values;
    debugger;
    updateEcoverse({
      variables: {
        input: {
          context: updateContextInput(values),
          displayName: name,
          ID: ecoverseId,
          hostID: host,
          tags: tagsets.flatMap(x => x.tags),
          authorizationPolicy: {
            anonymousReadAccess: anonymousReadAccess,
          },
        },
      },
    });
  };

  let submitWired;
  return (
    <Container maxWidth="xl">
      <Box marginY={4}>
        <Typography variant={'h2'}>{'Edit Ecoverse'}</Typography>
      </Box>
      <EcoverseEditForm
        isEdit={true}
        name={profile?.displayName}
        nameID={profile?.nameID}
        hostID={profile?.host?.id}
        tagset={profile?.tagset}
        context={profile?.context}
        anonymousReadAccess={profile?.authorization?.anonymousReadAccess}
        organizations={organizations}
        onSubmit={onSubmit}
        wireSubmit={submit => (submitWired = submit)}
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
export default EditEcoverse;
