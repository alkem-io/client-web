import React, { FC, useMemo } from 'react';
import HubEditForm, { HubEditFormValuesType } from '../../../../platform/admin/components/HubEditForm';
import SaveButton from '../../../../../core/ui/actions/SaveButton';
import { useOrganizationsListQuery, useUpdateHubMutation } from '../../../../../core/apollo/generated/apollo-hooks';
import { useHub } from '../../HubContext/useHub';
import { useNotification } from '../../../../../core/ui/notifications/useNotification';
import { updateContextInput } from '../../../../../common/utils/buildContext';
import { Box, Container } from '@mui/material';
import EditVisualsView from '../../../../common/visual/views/EditVisualsView';
import { formatDatabaseLocation } from '../../../../common/location/LocationUtils';
import { sortBy } from 'lodash';

export const HubProfile: FC = () => {
  const { hubNameId, ...hub } = useHub();
  const { data: organizationList, loading: loadingOrganizations } = useOrganizationsListQuery();
  const notify = useNotification();

  const [updateHub, { loading: loading1 }] = useUpdateHubMutation({
    onCompleted: () => onSuccess('Successfully updated'),
  });

  const organizations = useMemo(
    () => organizationList?.organizations.map(e => ({ id: e.id, name: e.profile.displayName })) || [],
    [organizationList]
  );

  const isLoading = loading1 || loadingOrganizations;

  const onSuccess = (message: string) => {
    notify(message, 'success');
  };

  const onSubmit = async (values: HubEditFormValuesType) => {
    const { name, host, tagsets, references } = values;
    updateHub({
      variables: {
        input: {
          context: updateContextInput({ ...values }),
          profileData: {
            displayName: name,
            location: formatDatabaseLocation(values.location),
            references: references?.map(reference => ({
              ID: reference.id ?? '',
              name: reference.name,
              description: reference.description,
              uri: reference.uri,
            })),
            tagsets: tagsets.map(tagset => ({ ID: tagset.id, name: tagset.name, tags: tagset.tags })),
          },
          ID: hubNameId,
          hostID: host,
        },
      },
    });
  };

  const organizationsSorted = useMemo(() => sortBy(organizations, org => org.name), [organizations]);

  const visuals = hub.profile.visuals ?? [];
  let submitWired;
  return (
    <Container maxWidth="xl">
      <HubEditForm
        isEdit
        name={hub.profile.displayName}
        nameID={hubNameId}
        hostID={hub.hostId}
        tagset={hub.profile.tagset}
        context={hub.context}
        profile={hub.profile}
        organizations={organizationsSorted}
        onSubmit={onSubmit}
        wireSubmit={submit => (submitWired = submit)}
      />
      <Box display={'flex'} marginY={4} justifyContent={'flex-end'}>
        <SaveButton loading={isLoading} onClick={() => submitWired()} />
      </Box>
      <Box paddingY={2}>
        <EditVisualsView visuals={visuals} />
      </Box>
    </Container>
  );
};

export default HubProfile;
