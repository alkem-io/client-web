import SaveButton from '@/core/ui/actions/SaveButton';
import { useSpaceProfileQuery, useUpdateSpaceMutation } from '@/core/apollo/generated/apollo-hooks';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { Box, Container, Grid } from '@mui/material';
import SpaceContextForm, { SpaceAboutEditFormValuesType } from '@/domain/journey/space/about/SpaceAboutForm';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { SpaceAboutContextDetailsFragment } from '@/core/apollo/generated/graphql-schema';

export const SpaceContextView = () => {
  const notify = useNotification();
  const { spaceId } = useUrlResolver();
  const { data: spaceData } = useSpaceProfileQuery({
    variables: {
      spaceId: spaceId!,
    },
    skip: !spaceId,
  });

  const about: SpaceAboutContextDetailsFragment = spaceData?.lookup.space?.about!;

  const [updateSpace, { loading: isUpdatingSpace }] = useUpdateSpaceMutation({
    onCompleted: () => onSuccess('Successfully updated'),
  });

  const isLoading = isUpdatingSpace;

  const onSuccess = (message: string) => {
    notify(message, 'success');
  };

  const onSubmit = (values: SpaceAboutEditFormValuesType) => {
    if (!spaceId) {
      notify('Space ID is missing', 'error');
      return;
    }
    return updateSpace({
      variables: {
        input: {
          about: {
            when: values.when,
            why: values.why,
            who: values.who,
            profile: {
              description: values.description,
            },
          },
          ID: spaceId,
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
          about={about}
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
