import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import HubEditForm, { HubEditFormValuesType } from '../../../components/Admin/HubEditForm';
import Button from '../../../components/core/Button';
import Typography from '../../../components/core/Typography';
import { useOrganizationsListQuery, useUpdateHubMutation } from '../../../hooks/generated/graphql';
import { useApolloErrorHandler } from '../../../hooks';
import { useHub } from '../../../hooks';
import { useUpdateNavigation } from '../../../hooks';
import { useNotification } from '../../../hooks';
import { PageProps } from '../../common';
import { updateContextInput } from '../../../utils/buildContext';
import { Box, Container } from '@mui/material';

interface HubEditProps extends PageProps {}

export const EditHub: FC<HubEditProps> = ({ paths }) => {
  const { t } = useTranslation();
  const currentPaths = useMemo(() => [...paths, { value: '', name: 'edit', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });
  const { hubNameId, hub } = useHub();
  const { data: organizationList, loading: loadingOrganizations } = useOrganizationsListQuery();
  const notify = useNotification();
  const handleError = useApolloErrorHandler();

  const [updateHub, { loading: loading1 }] = useUpdateHubMutation({
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

  const onSubmit = async (values: HubEditFormValuesType) => {
    const { name, host, tagsets, anonymousReadAccess } = values;
    updateHub({
      variables: {
        input: {
          context: updateContextInput(values),
          displayName: name,
          ID: hubNameId,
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
        <Typography variant={'h2'}>{'Edit Hub'}</Typography>
      </Box>
      <HubEditForm
        isEdit={true}
        name={hub?.displayName}
        nameID={hub?.nameID}
        hostID={hub?.host?.id}
        tagset={hub?.tagset}
        context={hub?.context}
        anonymousReadAccess={hub?.authorization?.anonymousReadAccess}
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
export default EditHub;
