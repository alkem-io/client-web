import { Grid } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotification } from '@/core/ui/notifications/useNotification';
import {
  refetchSubspaceProfileInfoQuery,
  useSubspaceProfileInfoQuery,
  useUpdateSpaceMutation,
} from '@/core/apollo/generated/apollo-hooks';
import SaveButton from '@/core/ui/actions/SaveButton';
import WrapperTypography from '@/core/ui/typography/deprecated/WrapperTypography';
import ProfileForm, { ProfileFormValues } from '@/domain/common/profile/ProfileForm';
import EditVisualsView from '@/domain/common/visual/EditVisuals/EditVisualsView';
import { formatDatabaseLocation } from '@/domain/common/location/LocationUtils';
import Gutters from '@/core/ui/grid/Gutters';
import { VisualType } from '@/core/apollo/generated/graphql-schema';

interface ChallengeProfileViewProps {
  subspaceId: string;
}

const SubspaceProfileView: FC<ChallengeProfileViewProps> = ({ subspaceId }) => {
  const { t } = useTranslation();
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

  const challenge = subspaceProfile?.lookup.space;

  const isLoading = isUpdating;

  const onSubmit = async (values: ProfileFormValues) => {
    const { name: displayName, nameID, tagsets, tagline, references } = values;

    if (!subspaceId) {
      throw new Error('Challenge ID is required for update');
    }
    updateSubspace({
      variables: {
        input: {
          ID: subspaceId,
          nameID: nameID,
          profileData: {
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
    });
  };

  let submitWired;
  return (
    <Gutters>
      <ProfileForm
        isEdit
        name={challenge?.profile.displayName}
        nameID={challenge?.nameID}
        tagset={challenge?.profile.tagset}
        profile={challenge?.profile}
        onSubmit={onSubmit}
        wireSubmit={submit => (submitWired = submit)}
      />
      <Grid container item justifyContent={'flex-end'}>
        <SaveButton loading={isLoading} onClick={() => submitWired()} />
      </Grid>
      <Grid item marginTop={2}>
        <WrapperTypography variant={'h4'} color={'primary'}>
          {t('components.visualSegment.title')}
        </WrapperTypography>
        <EditVisualsView visuals={challenge?.profile.visuals} visualTypes={[VisualType.Avatar, VisualType.Card]} />
      </Grid>
    </Gutters>
  );
};

export default SubspaceProfileView;
