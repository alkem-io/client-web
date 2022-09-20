import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import HubEditForm, { HubEditFormValuesType } from '../../../../admin/components/HubEditForm';
import WrapperButton from '../../../../../common/components/core/WrapperButton';
import { useOrganizationsListQuery, useUpdateHubMutation } from '../../../../../hooks/generated/graphql';
import { useApolloErrorHandler } from '../../../../../hooks';
import { useHub } from '../../../../../hooks';
import { useNotification } from '../../../../../hooks';
import { updateContextInput } from '../../../../../common/utils/buildContext';
import { Box, Container } from '@mui/material';
import EditVisualsView from '../../../../../views/Visuals/EditVisualsView';
import { formatDatabaseLocation } from '../../../../location/LocationUtils';

export const HubProfile: FC = () => {
  const { t } = useTranslation();
  const { hubNameId, visuals, ...hub } = useHub();
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
      <HubEditForm
        isEdit
        name={hub.displayName}
        nameID={hubNameId}
        hostID={hub.hostId}
        tagset={hub.tagset}
        context={hub.context}
        organizations={organizations}
        onSubmit={onSubmit}
        wireSubmit={submit => (submitWired = submit)}
      />
      <Box display={'flex'} marginY={4} justifyContent={'flex-end'}>
        <WrapperButton
          disabled={isLoading}
          variant="primary"
          onClick={() => submitWired()}
          text={t(`buttons.${isLoading ? 'processing' : 'save'}` as const)}
        />
      </Box>
      <Box paddingY={2}>
        <EditVisualsView visuals={visuals} />
      </Box>
    </Container>
  );
};
export default HubProfile;
