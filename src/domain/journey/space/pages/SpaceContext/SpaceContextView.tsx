import React, { FC } from 'react';
import SaveButton from '@/core/ui/actions/SaveButton';
import { useUpdateSpaceMutation } from '@/core/apollo/generated/apollo-hooks';
import { useSpace } from '../../SpaceContext/useSpace';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { Box, Container, Grid } from '@mui/material';
import SpaceContextForm, { SpaceEditFormValuesType } from '../../../../platform/admin/components/SpaceContextForm';

export const SpaceContextView: FC = () => {
  const { spaceNameId, ...space } = useSpace();
  const notify = useNotification();

  const [updateSpace, { loading: isUpdatingSpace }] = useUpdateSpaceMutation({
    onCompleted: () => onSuccess('Successfully updated'),
  });

  const isLoading = isUpdatingSpace;

  const onSuccess = (message: string) => {
    notify(message, 'success');
  };

  const onSubmit = async (values: SpaceEditFormValuesType) => {
    updateSpace({
      variables: {
        input: {
          context: {
            impact: values.impact,
            vision: values.vision,
            who: values.who,
          },
          profileData: {
            description: values.background,
          },
          ID: space.spaceId,
        },
      },
    });
  };

  let submitWired;
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
        <SpaceContextForm
          isEdit
          context={space.context}
          profile={space.profile}
          onSubmit={onSubmit}
          wireSubmit={submit => (submitWired = submit)}
          loading={isLoading}
        />
      </Grid>
      <Box display={'flex'} marginY={4} justifyContent={'flex-end'}>
        <SaveButton loading={isLoading} onClick={() => submitWired()} />
      </Box>
    </Container>
  );
};

export default SpaceContextView;
