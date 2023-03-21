import { Box, Container } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import HubEditForm, { HubEditFormValuesType } from '../../components/HubEditForm';
import SaveButton from '../../../../../core/ui/actions/SaveButton';
import WrapperTypography from '../../../../../common/components/core/WrapperTypography';
import AdminLayout from '../../layout/toplevel/AdminLayout';
import { AdminSection } from '../../layout/toplevel/constants';
import { useUpdateNavigation } from '../../../../../core/routing/useNavigation';
import { useNotification } from '../../../../../core/ui/notifications/useNotification';
import {
  HubDetailsFragmentDoc,
  useCreateHubMutation,
  useOrganizationsListQuery,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { useNavigateToEdit } from '../../../../../core/routing/useNavigateToEdit';
import { PageProps } from '../../../../shared/types/PageProps';
import { formatDatabaseLocation } from '../../../../common/location/LocationUtils';

interface NewHubProps extends PageProps {}

export const NewHub: FC<NewHubProps> = ({ paths }) => {
  const { t } = useTranslation();
  const currentPaths = useMemo(() => [...paths, { value: '', name: 'new', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });
  const navigateToEdit = useNavigateToEdit();
  const notify = useNotification();
  const { data: organizationList, loading: loadingOrganizations } = useOrganizationsListQuery();

  const [createHub, { loading: loading1 }] = useCreateHubMutation({
    // refetchQueries: [refetchHubsQuery()],
    // awaitRefetchQueries: true,
    onCompleted: data => {
      const hubId = data.createHub.nameID;
      if (hubId) {
        notify(t('pages.admin.hub.notifications.hub-created'), 'success');
        navigateToEdit(hubId);
      }
    },
    update: (cache, { data }) => {
      if (data) {
        const { createHub } = data;

        cache.modify({
          fields: {
            hubs(existingHubs = []) {
              const newHubRef = cache.writeFragment({
                data: createHub,
                fragment: HubDetailsFragmentDoc,
                fragmentName: 'HubDetails',
              });
              return [...existingHubs, newHubRef];
            },
          },
        });
      }
    },
  });

  const organizations = useMemo(
    () => organizationList?.organizations.map(e => ({ id: e.id, name: e.profile.displayName })) || [],
    [organizationList]
  );

  const isLoading = loading1 || loadingOrganizations;

  const onSubmit = async (values: HubEditFormValuesType) => {
    const { name, nameID, host, tagsets } = values;

    await createHub({
      variables: {
        input: {
          nameID,
          hostID: host,
          profileData: {
            displayName: name,
            tagline: values.tagline,
            location: formatDatabaseLocation(values.location),
          },
          tags: tagsets.flatMap(x => x.tags),
        },
      },
    });
  };

  let submitWired;
  return (
    <AdminLayout currentTab={AdminSection.Hub}>
      <Container maxWidth="xl">
        <Box marginY={3}>
          <WrapperTypography variant="h2">{'New Hub'}</WrapperTypography>
        </Box>
        <HubEditForm
          isEdit={false}
          onSubmit={onSubmit}
          wireSubmit={submit => (submitWired = submit)}
          organizations={organizations}
        />
        <Box display="flex" marginY={4} justifyContent="flex-end">
          <SaveButton loading={isLoading} onClick={() => submitWired()} />
        </Box>
      </Container>
    </AdminLayout>
  );
};

export default NewHub;
