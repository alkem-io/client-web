import { Grid } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Path } from '../../context/NavigationProvider';
import { useApolloErrorHandler, useChallenge, useNotification, useUpdateNavigation, useUrlParams } from '../../hooks';
import {
  refetchOpportunitiesQuery,
  refetchOpportunityProfileInfoQuery,
  useCreateOpportunityMutation,
  useHubLifecycleTemplatesQuery,
  useOpportunityProfileInfoQuery,
  useUpdateOpportunityMutation,
} from '../../hooks/generated/graphql';
import { useNavigateToEdit } from '../../hooks/useNavigateToEdit';
import { createContextInput, updateContextInput } from '../../utils/buildContext';
import Button from '../core/Button';
import Typography from '../core/Typography';
import ProfileFormWithContext, { ProfileFormValuesType } from '../composite/forms/ProfileFormWithContext';
import FormMode from './FormMode';
import { Context, LifecycleType } from '../../models/graphql-schema';
import { formatDatabaseLocation } from '../../domain/location/LocationUtils';

interface Props {
  mode: FormMode;
  paths: Path[];
  title: string;
}

const EditOpportunity: FC<Props> = ({ paths, mode, title }) => {
  const { t } = useTranslation();
  const navigateToEdit = useNavigateToEdit();
  const notify = useNotification();
  const handleError = useApolloErrorHandler();

  const { challengeId } = useChallenge();

  const { hubNameId = '', opportunityNameId = '', challengeNameId = '' } = useUrlParams();

  const [createOpportunity, { loading: isCreating }] = useCreateOpportunityMutation({
    refetchQueries: [refetchOpportunitiesQuery({ hubId: hubNameId, challengeId: challengeNameId })],
    awaitRefetchQueries: true,
    onCompleted: data => {
      notify(t('pages.admin.opportunity.notifications.opportunity-created'), 'success');
      navigateToEdit(data.createOpportunity.nameID);
    },
    onError: handleError,
  });
  const [updateOpportunity, { loading: isUpdating }] = useUpdateOpportunityMutation({
    onCompleted: () => notify(t('pages.admin.opportunity.notifications.opportunity-updated'), 'success'),
    onError: handleError,
    refetchQueries: [refetchOpportunityProfileInfoQuery({ hubId: hubNameId, opportunityId: opportunityNameId })],
    awaitRefetchQueries: true,
  });

  const { data: opportunityProfile } = useOpportunityProfileInfoQuery({
    variables: { hubId: hubNameId, opportunityId: opportunityNameId },
    skip: mode === FormMode.create,
  });

  const { data: hubLifecycleTemplates } = useHubLifecycleTemplatesQuery({
    variables: { hubId: hubNameId },
  });
  const innovationFlowTemplates = hubLifecycleTemplates?.hub?.templates?.lifecycleTemplates;
  const filteredInnovationFlowTemplates = innovationFlowTemplates?.filter(
    template => template.type === LifecycleType.Opportunity
  );
  const opportunity = opportunityProfile?.hub?.opportunity;
  const opportunityId = useMemo(() => opportunity?.id || '', [opportunity]);

  const isLoading = isCreating || isUpdating;

  const currentPaths = useMemo(
    () => [...paths, { name: opportunityId ? 'edit' : 'new', real: false }],
    [paths, opportunity]
  );
  useUpdateNavigation({ currentPaths });

  const onSubmit = async (values: ProfileFormValuesType) => {
    const { name, nameID, tagsets, innovationFlowTemplateID } = values;

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
              innovationFlowTemplateID: innovationFlowTemplateID,
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
      <Grid item>
        <Typography variant={'h2'}>{title}</Typography>
      </Grid>
      <ProfileFormWithContext
        isEdit={mode === FormMode.update}
        name={opportunity?.displayName}
        nameID={opportunity?.nameID}
        tagset={opportunity?.tagset}
        innovationFlowTemplates={filteredInnovationFlowTemplates}
        context={opportunity?.context as Context}
        onSubmit={onSubmit}
        wireSubmit={submit => (submitWired = submit)}
      />
      <Grid container item justifyContent={'flex-end'}>
        <Button disabled={isLoading} color="primary" onClick={() => submitWired()}>
          {t(`buttons.${isLoading ? 'processing' : 'save'}` as const)}
        </Button>
      </Grid>
    </Grid>
  );
};
export default EditOpportunity;
