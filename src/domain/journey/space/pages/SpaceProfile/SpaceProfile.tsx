import SpaceEditForm, { SpaceEditFormValuesType } from '@/domain/journey/space/spaceEditForm/SpaceEditForm';
import { useSpaceProfileQuery, useUpdateSpaceMutation } from '@/core/apollo/generated/apollo-hooks';
import { useSpace } from '@/domain/journey/space/SpaceContext/useSpace';
import { useNotification } from '@/core/ui/notifications/useNotification';
import EditVisualsView from '@/domain/common/visual/EditVisuals/EditVisualsView';
import { formatDatabaseLocation } from '@/domain/common/location/LocationUtils';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import { useTranslation } from 'react-i18next';

export const SpaceProfile = () => {
  const { spaceId, spaceNameId } = useSpace();
  const notify = useNotification();
  const { t } = useTranslation();
  const { data: spaceData } = useSpaceProfileQuery({
    variables: {
      spaceId,
    },
    skip: !spaceId,
  });
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
          ID: spaceId,
        },
      },
    });
  };
  const space = spaceData?.lookup.space;
  const visuals = space?.about.profile.visuals ?? [];

  return (
    <PageContentColumn columns={12}>
      <SpaceEditForm
        edit
        name={space?.about.profile.displayName}
        nameID={spaceNameId}
        tagset={space?.about.profile.tagset}
        context={space?.context}
        profile={space?.about.profile}
        onSubmit={onSubmit}
        loading={loading}
      />
      <PageContentBlock>
        <PageContentBlockHeader title={t('common.visuals')} />
        <EditVisualsView visuals={visuals} />
      </PageContentBlock>
    </PageContentColumn>
  );
};

export default SpaceProfile;
