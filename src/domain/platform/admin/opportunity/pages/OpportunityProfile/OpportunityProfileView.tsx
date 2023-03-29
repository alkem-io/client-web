import { Grid, Typography } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { createContextInput, updateContextInput } from '../../../../../../common/utils/buildContext';
import FormMode from '../../../components/FormMode';
import ProfileForm, { ProfileFormValues } from '../../../../../../common/components/composite/forms/ProfileForm';
import { useNotification } from '../../../../../../core/ui/notifications/useNotification';
import { useChallenge } from '../../../../../challenge/challenge/hooks/useChallenge';
import { useUrlParams } from '../../../../../../core/routing/useUrlParams';
import {
  useCreateOpportunityMutation,
  refetchOpportunitiesQuery,
  useUpdateOpportunityMutation,
  refetchOpportunityProfileInfoQuery,
  useOpportunityProfileInfoQuery,
} from '../../../../../../core/apollo/generated/apollo-hooks';
import { useNavigateToEdit } from '../../../../../../core/routing/useNavigateToEdit';
import EditVisualsView from '../../../../../common/visual/views/EditVisualsView';
import { formatDatabaseLocation } from '../../../../../common/location/LocationUtils';
import SaveButton from '../../../../../../core/ui/actions/SaveButton';

interface Props {
  mode: FormMode;
}

const OpportunityProfileView: FC<Props> = ({ mode }) => {
  const { t } = useTranslation();
  const navigateToEdit = useNavigateToEdit();
  const notify = useNotification();
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
  });
  const [updateOpportunity, { loading: isUpdating }] = useUpdateOpportunityMutation({
    onCompleted: () => onSuccess('Successfully updated'),
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
    const { name: displayName, tagline, nameID, tagsets, references } = values;

    switch (mode) {
      case FormMode.create:
        createOpportunity({
          variables: {
            input: {
              nameID: nameID,
              context: createContextInput({ ...values }),
              profileData: {
                displayName,
                location: formatDatabaseLocation(values.location),
              },
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
              context: updateContextInput({ ...values }),
              ID: opportunityId,
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
    <Grid container spacing={2}>
      <ProfileForm
        isEdit={mode === FormMode.update}
        name={opportunity?.profile.displayName}
        nameID={opportunity?.nameID}
        journeyType="opportunity"
        tagset={opportunity?.profile.tagset}
        context={opportunity?.context}
        profile={opportunity?.profile}
        onSubmit={onSubmit}
        wireSubmit={submit => (submitWired = submit)}
      />
      <Grid container item justifyContent={'flex-end'}>
        <SaveButton loading={isLoading} onClick={() => submitWired()} />
      </Grid>
      <Grid item marginTop={2}>
        <Typography variant={'h4'} color={'primary'}>
          {t('components.visualSegment.title')}
        </Typography>
        <EditVisualsView visuals={opportunity?.profile.visuals} />
      </Grid>
    </Grid>
  );
};

export default OpportunityProfileView;
