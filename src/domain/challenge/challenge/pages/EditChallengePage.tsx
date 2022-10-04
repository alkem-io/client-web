import { Grid } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Path } from '../../../../context/NavigationProvider';
import { useApolloErrorHandler, useNotification, useUpdateNavigation, useUrlParams } from '../../../../hooks';
import {
  refetchChallengeProfileInfoQuery,
  refetchChallengesWithCommunityQuery,
  useChallengeProfileInfoQuery,
  useCreateChallengeMutation,
  useHubLifecycleTemplatesQuery,
  useUpdateChallengeMutation,
} from '../../../../hooks/generated/graphql';
import { useNavigateToEdit } from '../../../../hooks/useNavigateToEdit';
import { createContextInput, updateContextInput } from '../../../../common/utils/buildContext';
import WrapperButton from '../../../../common/components/core/WrapperButton';
import WrapperTypography from '../../../../common/components/core/WrapperTypography';
import ProfileFormWithContext, {
  ProfileFormValuesType,
} from '../../../../common/components/composite/forms/ProfileFormWithContext';
import FormMode from '../../../platform/admin/components/FormMode';
import { formatDatabaseLocation } from '../../../common/location/LocationUtils';
import { LifecycleType } from '../../../../models/graphql-schema';
import { ChallengeContextSegment } from '../../../platform/admin/challenge/ChallengeContextSegment';

interface Props {
  mode: FormMode;
  paths: Path[];
  title: string;
}

const EditChallengePage: FC<Props> = ({ paths, mode, title }) => {
  const { t } = useTranslation();
  const navigateToEdit = useNavigateToEdit();
  const notify = useNotification();
  const handleError = useApolloErrorHandler();

  const { challengeNameId = '', hubNameId = '' } = useUrlParams();

  const [createChallenge, { loading: isCreating }] = useCreateChallengeMutation({
    onCompleted: data => {
      notify(t('pages.admin.challenge.notifications.challenge-created'), 'success');
      navigateToEdit(data.createChallenge.nameID);
    },
    onError: handleError,
    refetchQueries: [refetchChallengesWithCommunityQuery({ hubId: hubNameId })],
    awaitRefetchQueries: true,
  });

  const [updateChallenge, { loading: isUpdating }] = useUpdateChallengeMutation({
    onCompleted: () => notify(t('pages.admin.challenge.notifications.challenge-updated'), 'success'),
    onError: handleError,
    refetchQueries: [refetchChallengeProfileInfoQuery({ hubId: hubNameId, challengeId: challengeNameId })],
    awaitRefetchQueries: true,
  });

  const { data: challengeProfile } = useChallengeProfileInfoQuery({
    variables: { hubId: hubNameId, challengeId: challengeNameId },
    skip: mode === FormMode.create,
  });

  const { data: hubLifecycleTemplates } = useHubLifecycleTemplatesQuery({
    variables: { hubId: hubNameId },
  });
  const innovationFlowTemplates = hubLifecycleTemplates?.hub?.templates?.lifecycleTemplates;
  const filteredInnovationFlowTemplates = innovationFlowTemplates?.filter(
    template => template.type === LifecycleType.Challenge
  );
  const challenge = challengeProfile?.hub?.challenge;
  const challengeId = useMemo(() => challenge?.id || '', [challenge]);

  const isLoading = isCreating || isUpdating;

  const currentPaths = useMemo(
    () => [...paths, { name: challengeId ? 'edit' : 'new', real: false }],
    [paths, challenge]
  );
  useUpdateNavigation({ currentPaths });

  const onSubmit = async (values: ProfileFormValuesType) => {
    const { name, nameID, tagsets, innovationFlowTemplateID } = values;

    switch (mode) {
      case FormMode.create:
        createChallenge({
          variables: {
            input: {
              nameID: nameID,
              displayName: name,
              hubID: hubNameId,
              context: createContextInput({ ...values, location: formatDatabaseLocation(values.location) }),
              tags: tagsets.flatMap(x => x.tags),
              innovationFlowTemplateID: innovationFlowTemplateID,
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
              displayName: name,
              context: updateContextInput({ ...values, location: formatDatabaseLocation(values.location) }),
              tags: tagsets.flatMap(x => x.tags),
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
      <Grid item>
        <WrapperTypography variant={'h2'}>{title}</WrapperTypography>
      </Grid>
      <ProfileFormWithContext
        contextSegment={ChallengeContextSegment}
        journeyType="challenge"
        isEdit={mode === FormMode.update}
        name={challenge?.displayName}
        nameID={challenge?.nameID}
        tagset={challenge?.tagset}
        context={challenge?.context}
        innovationFlowTemplates={filteredInnovationFlowTemplates}
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
    </Grid>
  );
};
export default EditChallengePage;
