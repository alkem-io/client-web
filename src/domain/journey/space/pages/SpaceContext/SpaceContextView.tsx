import SaveButton from '@/core/ui/actions/SaveButton';
import { useSpaceProfileQuery, useUpdateSpaceMutation } from '@/core/apollo/generated/apollo-hooks';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { Box, Container, Grid } from '@mui/material';
import SpaceContextForm, { SpaceEditFormValuesType } from '@/domain/platform/admin/components/SpaceContextForm';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';

export const SpaceContextView = () => {
  const notify = useNotification();
  const { spaceId } = useUrlResolver();
  const { data: spaceData } = useSpaceProfileQuery({
    variables: {
      spaceId: spaceId!,
    },
    skip: !spaceId,
  });

  const [updateSpace, { loading: isUpdatingSpace }] = useUpdateSpaceMutation({
    onCompleted: () => onSuccess('Successfully updated'),
  });

  const isLoading = isUpdatingSpace;

  const onSuccess = (message: string) => {
    notify(message, 'success');
  };

  const onSubmit = (values: SpaceEditFormValuesType) => {
    if (!spaceId) {
      notify('Space ID is missing', 'error');
      return;
    }
    return updateSpace({
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
          ID: spaceId,
        },
      },
    });
  };
  const space = spaceData?.lookup.space;
  let submitWired;
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
        <SpaceContextForm
          isEdit
          context={space?.context}
          profile={space?.profile}
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
