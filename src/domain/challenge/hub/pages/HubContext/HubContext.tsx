import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { HubEditFormValuesType } from '../../../../platform/admin/components/HubEditForm';
import WrapperButton from '../../../../../common/components/core/WrapperButton';
import { useOrganizationsListQuery, useUpdateHubMutation } from '../../../../../core/apollo/generated/apollo-hooks';
import { useHub } from '../../HubContext/useHub';
import { useNotification } from '../../../../../core/ui/notifications/useNotification';
import { useApolloErrorHandler } from '../../../../../core/apollo/hooks/useApolloErrorHandler';
import { updateContextInput } from '../../../../../common/utils/buildContext';
import { Box, Container, Grid } from '@mui/material';
import HubContextForm from '../../../../platform/admin/components/HubContextForm';
import { formatDatabaseLocation } from '../../../../common/location/LocationUtils';

export const HubContext: FC = () => {
  const { t } = useTranslation();

  const { hubNameId, ...hub } = useHub();
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
    const { name, host, tagsets } = values;
    updateHub({
      variables: {
        input: {
          context: updateContextInput({ ...values, location: formatDatabaseLocation(values.location) }),
          displayName: name,
          ID: hubNameId,
          hostID: host,
          tags: tagsets.flatMap(x => x.tags),
        },
      },
    });
  };

  let submitWired;
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
        <HubContextForm
          isEdit
          name={hub.displayName}
          nameID={hubNameId}
          hostID={hub.hostId}
          tagset={hub.tagset}
          context={hub.context}
          organizations={organizations}
          onSubmit={onSubmit}
          wireSubmit={submit => (submitWired = submit)}
          loading={isLoading}
        />
      </Grid>
      <Box display={'flex'} marginY={4} justifyContent={'flex-end'}>
        <WrapperButton
          disabled={isLoading}
          variant="primary"
          onClick={() => submitWired()}
          text={t(`buttons.${isLoading ? 'processing' : 'save'}` as const)}
        />
      </Box>
    </Container>
  );
};
export default HubContext;
