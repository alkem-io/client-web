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
import { Box, Container } from '@mui/material';

interface EcoverseEditProps extends PageProps {}

export const EditEcoverse: FC<EcoverseEditProps> = ({ paths }) => {
  const { t } = useTranslation();
  const currentPaths = useMemo(() => [...paths, { value: '', name: 'edit', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });
  const { ecoverseNameId, ecoverse } = useEcoverse();
  const { data: organizationList, loading: loadingOrganizations } = useOrganizationsListQuery();
  const notify = useNotification();
  const handleError = useApolloErrorHandler();

  const [updateEcoverse, { loading: loading1 }] = useUpdateEcoverseMutation({
    onCompleted: () => onSuccess('Successfully updated'),
    onError: handleError,
  });

  const organizations = useMemo(
    () => organizationList?.organizations.map(e => ({ id: e.id, name: e.displayName })) || [],
    [organizationList]
  );

  const isLoading = loading1 || loadingOrganizations;

  const onSuccess = (message: string) => {
    notify(message, 'success');
  };

  const onSubmit = async (values: EcoverseEditFormValuesType) => {
    const { name, host, tagsets, anonymousReadAccess } = values;
    updateEcoverse({
      variables: {
        input: {
          context: updateContextInput(values),
          displayName: name,
          ID: ecoverseNameId,
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
        name={ecoverse?.displayName}
        nameID={ecoverse?.nameID}
        hostID={ecoverse?.host?.id}
        tagset={ecoverse?.tagset}
        context={ecoverse?.context}
        anonymousReadAccess={ecoverse?.authorization?.anonymousReadAccess}
        organizations={organizations}
        onSubmit={onSubmit}
        wireSubmit={submit => (submitWired = submit)}
      />
      <Box display={'flex'} marginY={4} justifyContent={'flex-end'}>
        <Button
          disabled={isLoading}
          variant="primary"
          onClick={() => submitWired()}
          text={t(`buttons.${isLoading ? 'processing' : 'save'}` as const)}
        />
      </Box>
    </Container>
  );
};
export default EditEcoverse;
