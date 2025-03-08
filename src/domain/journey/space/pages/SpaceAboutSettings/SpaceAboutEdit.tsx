import { useSpaceAboutBaseQuery, useUpdateSpaceMutation } from '@/core/apollo/generated/apollo-hooks';
import { useNotification } from '@/core/ui/notifications/useNotification';
import EditVisualsView from '@/domain/common/visual/EditVisuals/EditVisualsView';
import { formatDatabaseLocation } from '@/domain/common/location/LocationUtils';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import { useTranslation } from 'react-i18next';
import SpaceAboutView from './SpaceAboutView';
import ProfileForm, { ProfileFormValues } from '@/domain/common/profile/ProfileForm';
import SaveButton from '@/core/ui/actions/SaveButton';
import { Actions } from '@/core/ui/actions/Actions';
import React from 'react';
import { SpaceLevel, VisualType } from '@/core/apollo/generated/graphql-schema';

type Props = {
  spaceId: string | undefined;
};

export const SpaceAboutEdit = ({ spaceId = '' }: Props) => {
  const notify = useNotification();
  const { t } = useTranslation();
  const { data: spaceData } = useSpaceAboutBaseQuery({
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

  const onSubmit = async (values: ProfileFormValues) => {
    const { name: displayName, tagline, tagsets, references } = values;
    updateSpace({
      variables: {
        input: {
          about: {
            profile: {
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
          },
          ID: spaceId,
        },
      },
    });
  };
  const space = spaceData?.lookup.space;
  const visuals = space?.about.profile.visuals ?? [];
  let submitWired;

  return (
    <PageContentColumn columns={12}>
      <PageContentBlock>
        <PageContentBlockHeader title={t('components.editSpaceForm.about')} />
        <ProfileForm
          name={space?.about.profile.displayName}
          tagset={space?.about.profile.tagset}
          profile={space?.about.profile}
          onSubmit={onSubmit}
          wireSubmit={submit => (submitWired = submit)}
        />
        <Actions justifyContent={'flex-end'}>
          <SaveButton loading={loading} onClick={() => submitWired()} />
        </Actions>
      </PageContentBlock>
      <PageContentBlock>
        <PageContentBlockHeader title={t('common.description')} />
        <SpaceAboutView />
      </PageContentBlock>
      <PageContentBlock>
        <PageContentBlockHeader title={t('common.visuals')} />
        <EditVisualsView
          visuals={visuals}
          visualTypes={space?.level === SpaceLevel.L0 ? undefined : [VisualType.Avatar, VisualType.Card]}
        />
      </PageContentBlock>
    </PageContentColumn>
  );
};

export default SpaceAboutEdit;
