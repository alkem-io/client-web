import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import HubEditForm, { HubEditFormValuesType } from '../../../../platform/admin/components/HubEditForm';
import WrapperButton from '../../../../../common/components/core/WrapperButton';
import { useOrganizationsListQuery, useUpdateHubMutation } from '../../../../../core/apollo/generated/apollo-hooks';
import { useHub } from '../../HubContext/useHub';
import { useNotification } from '../../../../../core/ui/notifications/useNotification';
import { updateContextInput } from '../../../../../common/utils/buildContext';
import { Box, Container } from '@mui/material';
import EditVisualsView from '../../../../common/visual/views/EditVisualsView';
import { formatDatabaseLocation } from '../../../../common/location/LocationUtils';
import { sortBy } from 'lodash';

export const HubProfile: FC = () => {
  const { t } = useTranslation();
  const { hubNameId, ...hub } = useHub();
  const { data: organizationList, loading: loadingOrganizations } = useOrganizationsListQuery();
  const notify = useNotification();

  const [updateHub, { loading: loading1 }] = useUpdateHubMutation({
    onCompleted: () => onSuccess('Successfully updated'),
  });

  const organizations = useMemo(
    () => organizationList?.organizations.map(e => ({ id: e.id, name: e.profile.displayName })) || [],
    [organizationList]
  );

  const isLoading = loading1 || loadingOrganizations;

  const onSuccess = (message: string) => {
    notify(message, 'success');
  };

  const onSubmit = async (values: HubEditFormValuesType) => {
    const { name, host, tagsets } = values;
    console.log(values.references);
    updateHub({
      variables: {
        input: {
          context: updateContextInput({ ...values }),
          profileData: {
            displayName: name,
            location: formatDatabaseLocation(values.location),
            references: values.references?.map(reference => ({
              ID: reference.id ?? '',
              name: reference.name,
              description: reference.description,
              uri: reference.uri,
            })),
          },
          ID: hubNameId,
          hostID: host,
          tags: tagsets.flatMap(tagset => tagset.tags),
        },
      },
    });
  };

  const organizationsSorted = useMemo(() => sortBy(organizations, org => org.name), [organizations]);

  const visuals = hub.profile.visuals ?? [];

  let submitWired;
  return (
    <Container maxWidth="xl">
      <HubEditForm
        isEdit
        name={hub.profile.displayName}
        nameID={hubNameId}
        hostID={hub.hostId}
        tagset={hub.profile.tagset}
        context={hub.context}
        profile={hub.profile}
        organizations={organizationsSorted}
        onSubmit={onSubmit}
        wireSubmit={submit => (submitWired = submit)}
      />
      <Box display={'flex'} marginY={4} justifyContent={'flex-end'}>
        <WrapperButton
          disabled={isLoading}
          variant="primary"
          onClick={() => submitWired()}
          text={t(`buttons.${isLoading ? 'processing' : 'save'}` as const)}
        />
      </Box>
      <Box paddingY={2}>
        <EditVisualsView visuals={visuals} />
      </Box>
    </Container>
  );
};

export default HubProfile;
