import { Grid, Typography } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import FormMode from '../../../components/FormMode';
import ProfileForm, { ProfileFormValues } from '../../../../../common/profile/ProfileForm';
import { useNotification } from '../../../../../../core/ui/notifications/useNotification';
import {
  refetchOpportunitiesQuery,
  refetchOpportunityProfileInfoQuery,
  useCreateOpportunityMutation,
  useOpportunityProfileInfoQuery,
  useUpdateOpportunityMutation,
} from '../../../../../../core/apollo/generated/apollo-hooks';
import EditVisualsView from '../../../../../common/visual/EditVisuals/EditVisualsView';
import { formatDatabaseLocation } from '../../../../../common/location/LocationUtils';
import SaveButton from '../../../../../../core/ui/actions/SaveButton';
import Gutters from '../../../../../../core/ui/grid/Gutters';
import { VisualType } from '../../../../../../core/apollo/generated/graphql-schema';
import { useRouteResolver } from '../../../../../../main/routing/resolvers/RouteResolver';
import { useNavigate } from 'react-router-dom';
import { buildJourneyAdminUrl } from '../../../../../../main/routing/urlBuilders';

interface Props {
  mode: FormMode;
}

const OpportunityProfileView: FC<Props> = ({ mode }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const notify = useNotification();
  const onSuccess = (message: string) => notify(message, 'success');

  const { challengeId, opportunityId } = useRouteResolver();

  const [createOpportunity, { loading: isCreating }] = useCreateOpportunityMutation({
    refetchQueries: [refetchOpportunitiesQuery({ challengeId: challengeId! })],
    awaitRefetchQueries: true,
    onCompleted: data => {
      onSuccess('Successfully created');
      navigate(buildJourneyAdminUrl(data.createOpportunity.profile.url), { replace: true });
    },
  });

  const [updateOpportunity, { loading: isUpdating }] = useUpdateOpportunityMutation({
    onCompleted: () => onSuccess('Successfully updated'),
    refetchQueries: [refetchOpportunityProfileInfoQuery({ opportunityId: opportunityId! })],
    awaitRefetchQueries: true,
  });

  const { data: opportunityProfile } = useOpportunityProfileInfoQuery({
    variables: { opportunityId: opportunityId! },
    skip: mode === FormMode.create,
  });

  const opportunity = opportunityProfile?.lookup.opportunity;

  const isLoading = isCreating || isUpdating;

  const onSubmit = async (values: ProfileFormValues) => {
    const { name: displayName, tagline, nameID, tagsets, references } = values;

    if (!challengeId) {
      throw new Error('Challenge ID is required');
    }

    switch (mode) {
      case FormMode.create:
        createOpportunity({
          variables: {
            input: {
              nameID: nameID,
              profileData: {
                displayName,
                location: formatDatabaseLocation(values.location),
              },
              challengeID: challengeId,
              tags: tagsets.flatMap(x => x.tags),
              collaborationData: {
                innovationFlowTemplateID: '',
              },
            },
          },
        });
        break;
      case FormMode.update: {
        if (!opportunity) {
          throw new Error('Opportunity is not loaded');
        }

        updateOpportunity({
          variables: {
            input: {
              nameID: nameID,
              ID: opportunity.id,
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
      }
      default:
        throw new Error(`Submit mode expected: (${mode}) found`);
    }
  };

  let submitWired;
  return (
    <Gutters>
      <ProfileForm
        isEdit={mode === FormMode.update}
        name={opportunity?.profile.displayName}
        nameID={opportunity?.nameID}
        journeyType="opportunity"
        tagset={opportunity?.profile.tagset}
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
        <EditVisualsView visuals={opportunity?.profile.visuals} visualTypes={[VisualType.Avatar, VisualType.Card]} />
      </Grid>
    </Gutters>
  );
};

export default OpportunityProfileView;
