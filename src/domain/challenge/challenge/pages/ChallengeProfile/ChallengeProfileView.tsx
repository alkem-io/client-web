import { Grid } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../../../../../core/ui/notifications/useNotification';
import { useUrlParams } from '../../../../../core/routing/useUrlParams';
import {
  refetchChallengeProfileInfoQuery,
  refetchChallengesWithCommunityQuery,
  useChallengeProfileInfoQuery,
  useCreateChallengeMutation,
  useUpdateChallengeMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { useNavigateToEdit } from '../../../../../core/routing/useNavigateToEdit';
import { createContextInput, updateContextInput } from '../../../../../common/utils/buildContext';
import WrapperButton from '../../../../../common/components/core/WrapperButton';
import WrapperTypography from '../../../../../common/components/core/WrapperTypography';
import FormMode from '../../../../platform/admin/components/FormMode';
import ProfileForm, { ProfileFormValues } from '../../../../../common/components/composite/forms/ProfileForm';
import EditVisualsView from '../../../../common/visual/views/EditVisualsView';
import { formatDatabaseLocation } from '../../../../common/location/LocationUtils';

interface Props {
  mode: FormMode;
}

const ChallengeProfileView: FC<Props> = ({ mode }) => {
  const { t } = useTranslation();
  const navigateToEdit = useNavigateToEdit();
  const notify = useNotification();
  const onSuccess = (message: string) => notify(message, 'success');

  const { challengeNameId = '', hubNameId = '' } = useUrlParams();

  const [createChallenge, { loading: isCreating }] = useCreateChallengeMutation({
    onCompleted: data => {
      onSuccess('Successfully created');
      navigateToEdit(data.createChallenge.nameID);
    },
    refetchQueries: [refetchChallengesWithCommunityQuery({ hubId: hubNameId })],
    awaitRefetchQueries: true,
  });

  const [updateChallenge, { loading: isUpdating }] = useUpdateChallengeMutation({
    onCompleted: () => onSuccess('Successfully updated'),
    refetchQueries: [refetchChallengeProfileInfoQuery({ hubId: hubNameId, challengeId: challengeNameId })],
    awaitRefetchQueries: true,
  });

  const { data: challengeProfile } = useChallengeProfileInfoQuery({
    variables: { hubId: hubNameId, challengeId: challengeNameId },
    skip: mode === FormMode.create,
  });
  const challenge = challengeProfile?.hub?.challenge;
  const challengeId = useMemo(() => challenge?.id || '', [challenge]);

  const isLoading = isCreating || isUpdating;

  const onSubmit = async (values: ProfileFormValues) => {
    const { name, nameID, tagsets } = values;

    switch (mode) {
      case FormMode.create:
        createChallenge({
          variables: {
            input: {
              nameID: nameID,
              profileData: {
                displayName: name,
                location: formatDatabaseLocation(values.location),
              },
              hubID: hubNameId,
              context: createContextInput({ ...values }),
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
                displayName: name,
                location: formatDatabaseLocation(values.location),
                tagsets: tagsets.map(tagset => ({ ID: tagset.id, name: tagset.name, tags: tagset.tags })),
              },
              context: updateContextInput({ ...values }),
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
    <Grid container spacing={2}>
      <ProfileForm
        isEdit={mode === FormMode.update}
        name={challenge?.profile.displayName}
        nameID={challenge?.nameID}
        journeyType="challenge"
        tagset={challenge?.profile.tagset}
        context={challenge?.context}
        profile={challenge?.profile}
        onSubmit={onSubmit}
        wireSubmit={submit => (submitWired = submit)}
      />
      <Grid container item justifyContent={'flex-end'}>
        <WrapperButton
          disabled={isLoading}
          variant="primary"
          onClick={() => submitWired()}
          text={t(`buttons.${isLoading ? 'processing' : 'save'}` as const)}
        />
      </Grid>
      <Grid item marginTop={2}>
        <WrapperTypography variant={'h4'} color={'primary'}>
          {t('components.visualSegment.title')}
        </WrapperTypography>
        <EditVisualsView visuals={challenge?.profile.visuals} />
      </Grid>
    </Grid>
  );
};

export default ChallengeProfileView;
