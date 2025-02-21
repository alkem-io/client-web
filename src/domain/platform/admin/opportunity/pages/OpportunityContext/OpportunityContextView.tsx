import { Grid } from '@mui/material';
import { SpaceAboutForm, SpaceAboutFormValues } from '@/domain/space/about/settings/SpaceAboutForm';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { OpportunityContextSegment } from '@/domain/platform/admin/opportunity/OpportunityContextSegment';
import SaveButton from '@/core/ui/actions/SaveButton';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import {
  refetchSubspaceProfileInfoQuery,
  useSubspaceProfileInfoQuery,
  useUpdateSpaceMutation,
} from '@/core/apollo/generated/apollo-hooks';

const OpportunityContextView = () => {
  const notify = useNotification();
  const onSuccess = (message: string) => notify(message, 'success');

  const { spaceId } = useUrlResolver();

  const [updateSubspace, { loading: isUpdating }] = useUpdateSpaceMutation({
    onCompleted: () => onSuccess('Successfully updated'),
    refetchQueries: [refetchSubspaceProfileInfoQuery({ subspaceId: spaceId! })],
    awaitRefetchQueries: true,
  });

  const { data: subspacePrfile, loading } = useSubspaceProfileInfoQuery({
    variables: { subspaceId: spaceId! },
    skip: !spaceId,
  });

  const opportunity = subspacePrfile?.lookup.space;

  const onSubmit = async (values: SpaceAboutFormValues) => {
    if (!opportunity) {
      throw new TypeError('Opportunity is not loaded');
    }
    await updateSubspace({
      variables: {
        input: {
          about: {
            why: values.why,
            who: values.who,
            profile: {
              description: values.description,
            },
          },
          ID: opportunity.id,
        },
      },
    });
  };

  let submitWired;
  return (
    <Grid container spacing={2}>
      <SpaceAboutForm
        contextSegment={OpportunityContextSegment}
        about={opportunity?.about}
        loading={loading || isUpdating}
        onSubmit={onSubmit}
        wireSubmit={submit => (submitWired = submit)}
      />
      <Grid container item justifyContent={'flex-end'}>
        <SaveButton loading={isUpdating} onClick={() => submitWired()} />
      </Grid>
    </Grid>
  );
};

export default OpportunityContextView;
