import { Grid } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { useUrlParams } from '@/core/routing/useUrlParams';
import {
  refetchAdminSpaceSubspacesPageQuery,
  refetchDashboardWithMembershipsQuery,
  refetchSubspaceProfileInfoQuery,
  useCreateSubspaceMutation,
  useSubspaceProfileInfoQuery,
  useUpdateSpaceMutation,
} from '@/core/apollo/generated/apollo-hooks';
import SaveButton from '@/core/ui/actions/SaveButton';
import WrapperTypography from '@/core/ui/typography/deprecated/WrapperTypography';
import FormMode from '../../../../platform/admin/components/FormMode';
import ProfileForm, { ProfileFormValues } from '../../../../common/profile/ProfileForm';
import EditVisualsView from '../../../../common/visual/EditVisuals/EditVisualsView';
import { formatDatabaseLocation } from '../../../../common/location/LocationUtils';
import Gutters from '@/core/ui/grid/Gutters';
import { VisualType } from '@/core/apollo/generated/graphql-schema';
import { useRouteResolver } from '@/main/routing/resolvers/RouteResolver';
import useNavigate from '@/core/routing/useNavigate';
import { buildSettingsUrl } from '@/main/routing/urlBuilders';

interface ChallengeProfileViewProps {
  mode: FormMode;
}

const SubspaceProfileView: FC<ChallengeProfileViewProps> = ({ mode }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const notify = useNotification();
  const onSuccess = (message: string) => notify(message, 'success');

  const { spaceNameId = '' } = useUrlParams();

  const { subSpaceId: challengeId } = useRouteResolver();

  const [createSubspace, { loading: isCreating }] = useCreateSubspaceMutation({
    onCompleted: data => {
      onSuccess('Successfully created');
      navigate(buildSettingsUrl(data.createSubspace.profile.url), { replace: true });
    },
    refetchQueries: [
      refetchAdminSpaceSubspacesPageQuery({ spaceId: spaceNameId }),
      refetchDashboardWithMembershipsQuery(),
    ],
    awaitRefetchQueries: true,
  });

  const [updateSubspace, { loading: isUpdating }] = useUpdateSpaceMutation({
    onCompleted: () => onSuccess('Successfully updated'),
    refetchQueries: [refetchSubspaceProfileInfoQuery({ subspaceId: challengeId! })],
    awaitRefetchQueries: true,
  });

  const { data: subspaceProfile } = useSubspaceProfileInfoQuery({
    variables: { subspaceId: challengeId! },
    skip: mode === FormMode.create || !challengeId,
  });

  const challenge = subspaceProfile?.lookup.space;

  const isLoading = isCreating || isUpdating;

  const onSubmit = async (values: ProfileFormValues) => {
    const { name: displayName, nameID, tagsets, tagline, references } = values;

    // TODO: We need to select the template for the user if they want and put it in the collaborationData passing what we get using the createInput service

    switch (mode) {
      case FormMode.create:
        createSubspace({
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
              collaborationData: {},
            },
          },
        });
        break;
      case FormMode.update: {
        if (!challengeId) {
          throw new Error('Challenge ID is required for update');
        }
        updateSubspace({
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
        <WrapperTypography variant={'h4'} color={'primary'}>
          {t('components.visualSegment.title')}
        </WrapperTypography>
        <EditVisualsView visuals={challenge?.profile.visuals} visualTypes={[VisualType.Avatar, VisualType.Card]} />
      </Grid>
    </Gutters>
  );
};

export default SubspaceProfileView;
