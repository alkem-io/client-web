import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import FormMode from '@/domain/platform/admin/components/FormMode';
import ProfileForm, { ProfileFormValues } from '@/domain/common/profile/ProfileForm';
import { useNotification } from '@/core/ui/notifications/useNotification';
import EditVisualsView from '@/domain/common/visual/EditVisuals/EditVisualsView';
import { formatDatabaseLocation } from '@/domain/common/location/LocationUtils';
import SaveButton from '@/core/ui/actions/SaveButton';
import Gutters from '@/core/ui/grid/Gutters';
import { VisualType } from '@/core/apollo/generated/graphql-schema';
import { useRouteResolver } from '@/main/routing/resolvers/RouteResolver';
import useNavigate from '@/core/routing/useNavigate';
import {
  refetchSubspaceProfileInfoQuery,
  refetchSubspacesInSpaceQuery,
  useCreateSubspaceMutation,
  useSubspaceProfileInfoQuery,
  useUpdateSpaceMutation,
} from '@/core/apollo/generated/apollo-hooks';

// TODO: Probably this file should be removed (subspace?)
/**
 * @deprecated
 */
const OpportunityProfileView = ({ mode }: { mode: FormMode }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const notify = useNotification();
  const onSuccess = (message: string) => notify(message, 'success');

  const { subSpaceId: challengeId, subSubSpaceId: opportunityId } = useRouteResolver();

  const [createSubspace, { loading: isCreating }] = useCreateSubspaceMutation({
    refetchQueries: [refetchSubspacesInSpaceQuery({ spaceId: challengeId! })],
    awaitRefetchQueries: true,
    onCompleted: data => {
      onSuccess('Successfully created');
      navigate(data.createSubspace.profile.url, { replace: true });
    },
  });

  const [updateSubspace, { loading: isUpdating }] = useUpdateSpaceMutation({
    onCompleted: () => onSuccess('Successfully updated'),
    refetchQueries: [refetchSubspaceProfileInfoQuery({ subspaceId: opportunityId! })],
    awaitRefetchQueries: true,
  });

  const { data: opportunityProfile } = useSubspaceProfileInfoQuery({
    variables: { subspaceId: opportunityId! },
    skip: !opportunityId || mode === FormMode.create,
  });

  const opportunity = opportunityProfile?.lookup.space;

  const isLoading = isCreating || isUpdating;

  const onSubmit = async (values: ProfileFormValues) => {
    const { name: displayName, tagline, nameID, tagsets, references } = values;

    if (!challengeId) {
      throw new Error('Challenge ID is required');
    }
    // TODO: We need to select the template for the user if they want and put it in the collaborationData passing what we get using the createInput service
    switch (mode) {
      case FormMode.create:
        createSubspace({
          variables: {
            input: {
              nameID: nameID,
              profileData: {
                displayName,
                location: formatDatabaseLocation(values.location),
              },
              spaceID: challengeId,
              tags: tagsets.flatMap(x => x.tags),
              collaborationData: {},
            },
          },
        });
        break;
      case FormMode.update: {
        if (!opportunity) {
          throw new Error('Opportunity is not loaded');
        }

        updateSubspace({
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
        journeyType="subsubspace"
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
