import {
  refetchSubspaceProfileInfoQuery,
  useSubspaceProfileInfoQuery,
  useUpdateSpaceMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { VisualType } from '@/core/apollo/generated/graphql-schema';
import SaveButton from '@/core/ui/actions/SaveButton';
import { useNotification } from '@/core/ui/notifications/useNotification';
import useEnsurePresence from '@/core/utils/ensurePresence';
import { formatDatabaseLocation } from '@/domain/common/location/LocationUtils';
import ProfileForm, { ProfileFormValues } from '@/domain/common/profile/ProfileForm';
import EditVisualsView from '@/domain/common/visual/EditVisuals/EditVisualsView';
import { Grid, Typography } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import SpaceContextView from '@/domain/journey/space/pages/SpaceProfile/SpaceContextView';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';

interface SubspaceProfileViewProps {
  subspaceId: string | undefined;
}

const SubspaceProfileView: FC<SubspaceProfileViewProps> = ({ subspaceId }) => {
  const { t } = useTranslation();
  const ensurePresence = useEnsurePresence();
  const notify = useNotification();
  const onSuccess = (message: string) => notify(message, 'success');

  const [updateSubspace, { loading: isUpdating }] = useUpdateSpaceMutation({
    onCompleted: () => onSuccess('Successfully updated'),
    refetchQueries: [refetchSubspaceProfileInfoQuery({ subspaceId: subspaceId! })],
    awaitRefetchQueries: true,
  });

  const { data: subspaceProfile } = useSubspaceProfileInfoQuery({
    variables: { subspaceId: subspaceId! },
    skip: !subspaceId,
  });

  const subspace = subspaceProfile?.lookup.space;

  const isLoading = isUpdating;

  const onSubmit = (values: ProfileFormValues) => {
    const { name: displayName, tagsets, tagline, references } = values;
    const requiredSubspaceId = ensurePresence(subspaceId, 'Subspace ID');

    return updateSubspace({
      variables: {
        input: {
          ID: requiredSubspaceId,
          about: {
            profile: {
              displayName,
              tagline,
              location: formatDatabaseLocation(values.location),
              tagsets: tagsets.map(tagset => ({ ID: tagset.id, name: tagset.name, tags: tagset.tags })),
              references: references.map(reference => ({
                ID: reference.id,
                name: reference.name,
                description: reference.description,
                uri: reference.uri,
              })),
            },
          },
        },
      },
    });
  };

  let submitWired;
  return (
    <PageContentColumn columns={12}>
      <PageContentBlock>
        <PageContentBlockHeader title={t('components.editSpaceForm.about')} />
        <ProfileForm
          isEdit
          name={subspace?.about.profile.displayName}
          tagset={subspace?.about.profile.tagset}
          profile={subspace?.about.profile}
          onSubmit={onSubmit}
          wireSubmit={submit => (submitWired = submit)}
        />
      </PageContentBlock>
      <Grid container item justifyContent={'flex-end'}>
        <SaveButton loading={isLoading} onClick={() => submitWired()} />
      </Grid>
      <PageContentBlock>
        <PageContentBlockHeader title={t('common.description')} />
        <SpaceContextView />
      </PageContentBlock>
      <Grid item marginTop={2}>
        <Typography variant="h4" color="primary.main" mb={1} fontWeight="medium">
          {t('components.visualSegment.title')}
        </Typography>
        <EditVisualsView visuals={subspace?.about.profile.visuals} visualTypes={[VisualType.Avatar, VisualType.Card]} />
      </Grid>
    </PageContentColumn>
  );
};

export default SubspaceProfileView;
