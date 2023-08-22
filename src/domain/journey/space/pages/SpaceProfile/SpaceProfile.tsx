import React, { FC } from 'react';
import SpaceEditForm, { SpaceEditFormValuesType } from '../../../../platform/admin/components/SpaceEditForm';
import SaveButton from '../../../../../core/ui/actions/SaveButton';
import { useUpdateSpaceMutation } from '../../../../../core/apollo/generated/apollo-hooks';
import { useSpace } from '../../SpaceContext/useSpace';
import { useNotification } from '../../../../../core/ui/notifications/useNotification';
import { Box, Container } from '@mui/material';
import EditVisualsView from '../../../../common/visual/EditVisuals/EditVisualsView';
import { formatDatabaseLocation } from '../../../../common/location/LocationUtils';

export const SpaceProfile: FC = () => {
  const { spaceNameId, ...space } = useSpace();
  const notify = useNotification();

  const [updateSpace, { loading }] = useUpdateSpaceMutation({
    onCompleted: () => onSuccess('Successfully updated'),
  });

  const onSuccess = (message: string) => {
    notify(message, 'success');
  };

  const onSubmit = async (values: SpaceEditFormValuesType) => {
    const { name: displayName, tagline, tagsets, references } = values;
    updateSpace({
      variables: {
        input: {
          profileData: {
            displayName,
            tagline,
            location: formatDatabaseLocation(values.location),
            references: references?.map(reference => ({
              ID: reference.id ?? '',
              name: reference.name,
              description: reference.description,
              uri: reference.uri,
            })),
            tagsets: tagsets.map(tagset => ({ ID: tagset.id, name: tagset.name, tags: tagset.tags })),
          },
          ID: spaceNameId,
        },
      },
    });
  };

  const visuals = space.profile.visuals ?? [];
  let submitWired;
  return (
    <Container maxWidth="xl">
      <SpaceEditForm
        isEdit
        name={space.profile.displayName}
        nameID={spaceNameId}
        tagset={space.profile.tagset}
        context={space.context}
        profile={space.profile}
        onSubmit={onSubmit}
        wireSubmit={submit => (submitWired = submit)}
      />
      <Box display={'flex'} marginY={4} justifyContent={'flex-end'}>
        <SaveButton loading={loading} onClick={() => submitWired()} />
      </Box>
      <Box paddingY={2}>
        <EditVisualsView visuals={visuals} />
      </Box>
    </Container>
  );
};

export default SpaceProfile;
