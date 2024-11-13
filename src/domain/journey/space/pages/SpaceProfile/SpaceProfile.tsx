import React, { FC } from 'react';
import SpaceEditForm, { SpaceEditFormValuesType } from '../../spaceEditForm/SpaceEditForm';
import { useUpdateSpaceMutation } from '@core/apollo/generated/apollo-hooks';
import { useSpace } from '../../SpaceContext/useSpace';
import { useNotification } from '@core/ui/notifications/useNotification';
import EditVisualsView from '../../../../common/visual/EditVisuals/EditVisualsView';
import { formatDatabaseLocation } from '../../../../common/location/LocationUtils';
import PageContentBlock from '@core/ui/content/PageContentBlock';
import PageContentColumn from '@core/ui/content/PageContentColumn';
import PageContentBlockHeader from '@core/ui/content/PageContentBlockHeader';
import { useTranslation } from 'react-i18next';

export const SpaceProfile: FC = () => {
  const { spaceNameId, ...space } = useSpace();
  const notify = useNotification();
  const { t } = useTranslation();

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
          ID: space.spaceId,
        },
      },
    });
  };

  const visuals = space.profile.visuals ?? [];

  return (
    <PageContentColumn columns={12}>
      <SpaceEditForm
        edit
        name={space.profile.displayName}
        nameID={spaceNameId}
        tagset={space.profile.tagset}
        context={space.context}
        profile={space.profile}
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
