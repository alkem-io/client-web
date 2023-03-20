import React, { FC } from 'react';
import SaveButton from '../../../../../core/ui/actions/SaveButton';
import { useUpdateHubMutation } from '../../../../../core/apollo/generated/apollo-hooks';
import { useHub } from '../../HubContext/useHub';
import { useNotification } from '../../../../../core/ui/notifications/useNotification';
import { updateContextInput } from '../../../../../common/utils/buildContext';
import { Box, Container, Grid } from '@mui/material';
import HubContextForm, { HubEditFormValuesType } from '../../../../platform/admin/components/HubContextForm';

export const HubContextView: FC = () => {
  const { hubNameId, ...hub } = useHub();
  const notify = useNotification();

  const [updateHub, { loading: isUpdatingHub }] = useUpdateHubMutation({
    onCompleted: () => onSuccess('Successfully updated'),
  });

  const isLoading = isUpdatingHub;

  const onSuccess = (message: string) => {
    notify(message, 'success');
  };

  const onSubmit = async (values: HubEditFormValuesType) => {
    updateHub({
      variables: {
        input: {
          context: updateContextInput({ ...values }),
          profileData: {
            description: values.background,
          },
          ID: hubNameId,
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
          context={hub.context}
          profile={hub.profile}
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

export default HubContextView;
