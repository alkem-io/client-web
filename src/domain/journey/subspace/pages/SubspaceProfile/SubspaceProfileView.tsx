import {
  refetchSubspaceProfileInfoQuery,
  useSubspaceProfileInfoQuery,
  useUpdateSpaceMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { VisualType } from '@/core/apollo/generated/graphql-schema';
import SaveButton from '@/core/ui/actions/SaveButton';
import Gutters from '@/core/ui/grid/Gutters';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { formatDatabaseLocation } from '@/domain/common/location/LocationUtils';
import ProfileForm, { ProfileFormValues } from '@/domain/common/profile/ProfileForm';
import EditVisualsView from '@/domain/common/visual/EditVisuals/EditVisualsView';
import { Grid, Typography } from '@mui/material';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

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
        journeyType="subspace"
        tagset={challenge?.profile.tagset}
        profile={challenge?.profile}
        onSubmit={onSubmit}
        wireSubmit={submit => (submitWired = submit)}
      />
      <Grid container item justifyContent={'flex-end'}>
        <SaveButton loading={isLoading} onClick={() => submitWired()} />
      </Grid>
      <Grid item marginTop={2}>
        <Typography variant="h4" color="primary.main" mb={1} fontWeight="medium">
          {t('components.visualSegment.title')}
        </Typography>
        <EditVisualsView visuals={challenge?.profile.visuals} visualTypes={[VisualType.Avatar, VisualType.Card]} />
      </Grid>
    </Gutters>
  );
};

export default SubspaceProfileView;
