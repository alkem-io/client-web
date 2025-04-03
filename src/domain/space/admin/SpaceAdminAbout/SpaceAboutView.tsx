import SaveButton from '@/core/ui/actions/SaveButton';
import { useSpaceAboutFullQuery, useUpdateSpaceMutation } from '@/core/apollo/generated/apollo-hooks';
import { useNotification } from '@/core/ui/notifications/useNotification';
import SpaceAboutForm, { SpaceAboutEditFormValuesType } from '@/domain/space/admin/SpaceAdminAbout/SpaceAboutForm';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { SpaceAboutFullModel } from '@/domain/space/about/model/spaceAboutFull.model';
import { Actions } from '@/core/ui/actions/Actions';
import Loading from '@/core/ui/loading/Loading';

export const SpaceAboutView = () => {
  const notify = useNotification();
  const { spaceId, spaceLevel, loading: resolverLoading } = useUrlResolver();
  const { data: spaceData, loading: spaceDataLoading } = useSpaceAboutFullQuery({
    variables: {
      spaceId: spaceId!,
    },
    skip: !spaceId,
  });

  const about: SpaceAboutFullModel | undefined = spaceData?.lookup.space?.about;

  const [updateSpace, { loading: isLoading }] = useUpdateSpaceMutation({
    onCompleted: () => onSuccess('Successfully updated'),
  });

  if (resolverLoading || spaceDataLoading || !about) {
    return <Loading />;
  }

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

export default SpaceAboutView;
