import { Grid } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../../../../../core/ui/notifications/useNotification';
import { useUrlParams } from '../../../../../core/routing/useUrlParams';
import {
  refetchChallengeProfileInfoQuery,
  refetchChallengesWithProfileQuery,
  useChallengeProfileInfoQuery,
  useCreateChallengeMutation,
  useUpdateChallengeMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { useNavigateToEdit } from '../../../../../core/routing/useNavigateToEdit';
import SaveButton from '../../../../../core/ui/actions/SaveButton';
import WrapperTypography from '../../../../../common/components/core/WrapperTypography';
import FormMode from '../../../../platform/admin/components/FormMode';
import ProfileForm, { ProfileFormValues } from '../../../../../common/components/composite/forms/ProfileForm';
import EditVisualsView from '../../../../common/visual/EditVisuals/EditVisualsView';
import { formatDatabaseLocation } from '../../../../common/location/LocationUtils';
import Gutters from '../../../../../core/ui/grid/Gutters';
import { VisualType } from '../../../../../core/apollo/generated/graphql-schema';

interface ChallengeProfileViewProps {
  mode: FormMode;
}

const ChallengeProfileView: FC<ChallengeProfileViewProps> = ({ mode }) => {
  const { t } = useTranslation();
  const navigateToEdit = useNavigateToEdit();
  const notify = useNotification();
  const onSuccess = (message: string) => notify(message, 'success');

  const { challengeNameId = '', spaceNameId = '' } = useUrlParams();

  const [createChallenge, { loading: isCreating }] = useCreateChallengeMutation({
    onCompleted: data => {
      onSuccess('Successfully created');
      navigateToEdit(data.createChallenge.nameID);
    },
    refetchQueries: [refetchChallengesWithProfileQuery({ spaceId: spaceNameId })],
    awaitRefetchQueries: true,
  });

  const [updateChallenge, { loading: isUpdating }] = useUpdateChallengeMutation({
    onCompleted: () => onSuccess('Successfully updated'),
    refetchQueries: [refetchChallengeProfileInfoQuery({ spaceId: spaceNameId, challengeId: challengeNameId })],
    awaitRefetchQueries: true,
  });

  const { data: challengeProfile } = useChallengeProfileInfoQuery({
    variables: { spaceId: spaceNameId, challengeId: challengeNameId },
    skip: mode === FormMode.create,
  });
  const challenge = challengeProfile?.space?.challenge;
  const challengeId = useMemo(() => challenge?.id || '', [challenge]);

  const isLoading = isCreating || isUpdating;

  const onSubmit = async (values: ProfileFormValues) => {
    const { name: displayName, nameID, tagsets, tagline, references } = values;

    switch (mode) {
      case FormMode.create:
        createChallenge({
          variables: {
            input: {
              nameID: nameID,
              profileData: {
                displayName,
                tagline,
                location: formatDatabaseLocation(values.location),
              },
              spaceID: spaceNameId,
              tags: tagsets.flatMap(x => x.tags),
              innovationFlowTemplateID: '',
            },
          },
        });
        break;
      case FormMode.update:
        updateChallenge({
          variables: {
            input: {
              ID: challengeId,
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
        break;
      default:
        throw new Error(`Submit mode expected: (${mode}) found`);
    }
  };

  let submitWired;
  return (
    <Gutters>
      <ProfileForm
        isEdit={mode === FormMode.update}
        name={challenge?.profile.displayName}
        nameID={challenge?.nameID}
        journeyType="challenge"
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

export default ChallengeProfileView;
