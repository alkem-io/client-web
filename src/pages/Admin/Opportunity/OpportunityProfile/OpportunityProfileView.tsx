import { Grid } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useApolloErrorHandler, useChallenge, useNotification, useUrlParams } from '../../../../hooks';
import {
  refetchOpportunitiesQuery,
  refetchOpportunityProfileInfoQuery,
  useCreateOpportunityMutation,
  useOpportunityProfileInfoQuery,
  useUpdateOpportunityMutation,
} from '../../../../hooks/generated/graphql';
import { useNavigateToEdit } from '../../../../hooks/useNavigateToEdit';
import { createContextInput, updateContextInput } from '../../../../utils/buildContext';
import Button from '../../../../components/core/Button';
import Typography from '../../../../components/core/Typography';
import FormMode from '../../../../components/Admin/FormMode';
import { Context } from '../../../../models/graphql-schema';
import ProfileForm, { ProfileFormValues } from '../../../../components/composite/forms/ProfileForm';
import EditVisualsView from '../../../../views/Visuals/EditVisualsView';
import { formatDatabaseLocation } from '../../../../domain/location/LocationUtils';

interface Props {
  mode: FormMode;
}

const OpportunityProfileView: FC<Props> = ({ mode }) => {
  const { t } = useTranslation();
  const navigateToEdit = useNavigateToEdit();
  const notify = useNotification();
  const handleError = useApolloErrorHandler();
  const onSuccess = (message: string) => notify(message, 'success');

  const { challengeId } = useChallenge();

  const { hubNameId = '', opportunityNameId = '', challengeNameId = '' } = useUrlParams();

  const [createOpportunity, { loading: isCreating }] = useCreateOpportunityMutation({
    refetchQueries: [refetchOpportunitiesQuery({ hubId: hubNameId, challengeId: challengeNameId })],
    awaitRefetchQueries: true,
    onCompleted: data => {
      onSuccess('Successfully created');
      navigateToEdit(data.createOpportunity.nameID);
    },
    onError: handleError,
  });
  const [updateOpportunity, { loading: isUpdating }] = useUpdateOpportunityMutation({
    onCompleted: () => onSuccess('Successfully updated'),
    onError: handleError,
    refetchQueries: [refetchOpportunityProfileInfoQuery({ hubId: hubNameId, opportunityId: opportunityNameId })],
    awaitRefetchQueries: true,
  });

  const { data: opportunityProfile } = useOpportunityProfileInfoQuery({
    variables: { hubId: hubNameId, opportunityId: opportunityNameId },
    skip: mode === FormMode.create,
  });

  const opportunity = opportunityProfile?.hub?.opportunity;
  const opportunityId = useMemo(() => opportunity?.id || '', [opportunity]);

  const isLoading = isCreating || isUpdating;

  const onSubmit = async (values: ProfileFormValues) => {
    const { name, nameID, tagsets } = values;

    switch (mode) {
      case FormMode.create:
        createOpportunity({
          variables: {
            input: {
              nameID: nameID,
              context: createContextInput({ ...values, location: formatDatabaseLocation(values.location) }),
              displayName: name,
              challengeID: challengeId,
              tags: tagsets.flatMap(x => x.tags),
              innovationFlowTemplateID: '',
            },
          },
        });
        break;
      case FormMode.update:
        updateOpportunity({
          variables: {
            input: {
              nameID: nameID,
              context: updateContextInput({ ...values, location: formatDatabaseLocation(values.location) }),
              displayName: name,
              ID: opportunityId,
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
      <ProfileForm
        isEdit={mode === FormMode.update}
        name={opportunity?.displayName}
        nameID={opportunity?.nameID}
        tagset={opportunity?.tagset}
        context={opportunity?.context as Context}
        onSubmit={onSubmit}
        wireSubmit={submit => (submitWired = submit)}
      />
      <Grid container item justifyContent={'flex-end'}>
        <Button disabled={isLoading} color="primary" onClick={() => submitWired()}>
          {t(`buttons.${isLoading ? 'processing' : 'save'}` as const)}
        </Button>
      </Grid>
      <Grid item marginTop={2}>
        <Typography variant={'h4'} color={'primary'}>
          {t('components.visualSegment.title')}
        </Typography>
        <EditVisualsView visuals={opportunity?.context?.visuals} />
      </Grid>
    </Grid>
  );
};
export default OpportunityProfileView;
