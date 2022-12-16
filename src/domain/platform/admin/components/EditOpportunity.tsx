import { Grid } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Path } from '../../../../core/routing/NavigationProvider';
import { useNotification } from '../../../../core/ui/notifications/useNotification';
import { useApolloErrorHandler } from '../../../../core/apollo/hooks/useApolloErrorHandler';
import { useChallenge } from '../../../challenge/challenge/hooks/useChallenge';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { useUpdateNavigation } from '../../../../core/routing/useNavigation';
import {
  refetchOpportunitiesQuery,
  refetchOpportunityProfileInfoQuery,
  useCreateOpportunityMutation,
  useHubLifecycleTemplatesQuery,
  useOpportunityProfileInfoQuery,
  useUpdateOpportunityMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { useNavigateToEdit } from '../../../../core/routing/useNavigateToEdit';
import { createContextInput, updateContextInput } from '../../../../common/utils/buildContext';
import WrapperButton from '../../../../common/components/core/WrapperButton';
import WrapperTypography from '../../../../common/components/core/WrapperTypography';
import ProfileFormWithContext, {
  ProfileFormValuesType,
} from '../../../../common/components/composite/forms/ProfileFormWithContext';
import FormMode from './FormMode';
import { Context, LifecycleType } from '../../../../core/apollo/generated/graphql-schema';
import { formatDatabaseLocation } from '../../../common/location/LocationUtils';
import { OpportunityContextSegment } from '../opportunity/OpportunityContextSegment';

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

  const { data: opportunityProfile, loading } = useOpportunityProfileInfoQuery({
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

  const isLoading = loading || isCreating || isUpdating;

  const currentPaths = useMemo(
    () => [...paths, { name: opportunityId ? 'edit' : 'new', real: false }],
    [paths, opportunityId]
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
        <WrapperTypography variant={'h2'}>{title}</WrapperTypography>
      </Grid>
      <ProfileFormWithContext
        contextSegment={OpportunityContextSegment}
        journeyType="opportunity"
        isEdit={mode === FormMode.update}
        name={opportunity?.displayName}
        nameID={opportunity?.nameID}
        tagset={opportunity?.tagset}
        innovationFlowTemplates={filteredInnovationFlowTemplates}
        context={opportunity?.context as Context}
        onSubmit={onSubmit}
        wireSubmit={submit => (submitWired = submit)}
        loading={isLoading}
      />
      <Grid container item justifyContent={'flex-end'}>
        <WrapperButton disabled={isLoading} color="primary" onClick={() => submitWired()}>
          {t(`buttons.${isLoading ? 'processing' : 'save'}` as const)}
        </WrapperButton>
      </Grid>
    </Grid>
  );
};

export default EditOpportunity;
