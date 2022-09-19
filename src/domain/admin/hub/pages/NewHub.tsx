import { Box, Container } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import HubEditForm, { HubEditFormValuesType } from '../../components/HubEditForm';
import WrapperButton from '../../../../common/components/core/WrapperButton';
import WrapperTypography from '../../../../common/components/core/WrapperTypography';
import AdminLayout from '../../toplevel/AdminLayout';
import { AdminSection } from '../../toplevel/constants';
import { formatDatabaseLocation } from '../../../location/LocationUtils';
import { useApolloErrorHandler, useNotification, useUpdateNavigation } from '../../../../hooks';
import {
  HubDetailsFragmentDoc,
  useCreateHubMutation,
  useOrganizationsListQuery,
} from '../../../../hooks/generated/graphql';
import { useNavigateToEdit } from '../../../../hooks/useNavigateToEdit';
import { createContextInput } from '../../../../common/utils/buildContext';
import { PageProps } from '../../../../pages/common';

interface NewHubProps extends PageProps {}

export const NewHub: FC<NewHubProps> = ({ paths }) => {
  const { t } = useTranslation();
  const currentPaths = useMemo(() => [...paths, { value: '', name: 'new', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });
  const navigateToEdit = useNavigateToEdit();
  const notify = useNotification();
  const handleError = useApolloErrorHandler();
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
    onError: handleError,
  });

  const organizations = useMemo(
    () => organizationList?.organizations.map(e => ({ id: e.id, name: e.displayName })) || [],
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
          context: createContextInput({ ...values, location: formatDatabaseLocation(values.location) }),
          displayName: name,
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
          <WrapperButton
            disabled={isLoading}
            variant="primary"
            onClick={() => submitWired()}
            text={t(`buttons.${isLoading ? 'processing' : 'save'}` as const)}
          />
        </Box>
      </Container>
    </AdminLayout>
  );
};
export default NewHub;
