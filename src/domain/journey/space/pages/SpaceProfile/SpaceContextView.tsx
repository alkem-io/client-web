import SaveButton from '@/core/ui/actions/SaveButton';
import { useSpaceProfileQuery, useUpdateSpaceMutation } from '@/core/apollo/generated/apollo-hooks';
import { useNotification } from '@/core/ui/notifications/useNotification';
import SpaceAboutForm, { SpaceAboutEditFormValuesType } from '@/domain/space/about/settings/SpaceAboutForm';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { SpaceAboutDetailsModel } from '@/domain/space/about/model/SpaceAboutFull.model';
import { Actions } from '@/core/ui/actions/Actions';

export const SpaceContextView = () => {
  const notify = useNotification();
  const { spaceId, spaceLevel } = useUrlResolver();
  const { data: spaceData } = useSpaceProfileQuery({
    variables: {
      spaceId: spaceId!,
    },
    skip: !spaceId,
  });

  const about: SpaceAboutDetailsModel = spaceData?.lookup.space?.about!;

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
    <>
      <SpaceAboutForm
        isEdit
        spaceLevel={spaceLevel}
        about={about}
        onSubmit={onSubmit}
        wireSubmit={submit => (submitWired = submit)}
        loading={isLoading}
      />
      <Actions justifyContent={'flex-end'}>
        <SaveButton loading={isLoading} onClick={() => submitWired()} />
      </Actions>
    </>
  );
};

export default SpaceContextView;
