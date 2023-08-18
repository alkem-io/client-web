import { Box, Container } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SpaceEditForm, { SpaceEditFormValuesType } from '../../components/SpaceEditForm';
import SaveButton from '../../../../../core/ui/actions/SaveButton';
import WrapperTypography from '../../../../../core/ui/typography/deprecated/WrapperTypography';
import AdminLayout from '../../layout/toplevel/AdminLayout';
import { AdminSection } from '../../layout/toplevel/constants';
import { useUpdateNavigation } from '../../../../../core/routing/useNavigation';
import { useNotification } from '../../../../../core/ui/notifications/useNotification';
import {
  SpaceDetailsFragmentDoc,
  useCreateSpaceMutation,
  useOrganizationsListQuery,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { useNavigateToEdit } from '../../../../../core/routing/useNavigateToEdit';
import { PageProps } from '../../../../shared/types/PageProps';
import { formatDatabaseLocation } from '../../../../common/location/LocationUtils';

interface NewSpaceProps extends PageProps {}

export const NewSpace: FC<NewSpaceProps> = ({ paths }) => {
  const { t } = useTranslation();
  const currentPaths = useMemo(() => [...paths, { value: '', name: 'new', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });
  const navigateToEdit = useNavigateToEdit();
  const notify = useNotification();
  const { data: organizationList, loading: loadingOrganizations } = useOrganizationsListQuery();

  const [createSpace, { loading: loading1 }] = useCreateSpaceMutation({
    // refetchQueries: [refetchSpacesQuery()],
    // awaitRefetchQueries: true,
    onCompleted: data => {
      const spaceId = data.createSpace.nameID;
      if (spaceId) {
        notify(t('pages.admin.space.notifications.space-created'), 'success');
        navigateToEdit(spaceId);
      }
    },
    update: (cache, { data }) => {
      if (data) {
        const { createSpace } = data;

        cache.modify({
          fields: {
            spaces(existingSpaces = []) {
              const newSpaceRef = cache.writeFragment({
                data: createSpace,
                fragment: SpaceDetailsFragmentDoc,
                fragmentName: 'SpaceDetails',
              });
              return [...existingSpaces, newSpaceRef];
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

  const onSubmit = async (values: SpaceEditFormValuesType) => {
    const { name, nameID, host, tagsets } = values;

    await createSpace({
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
    <AdminLayout currentTab={AdminSection.Space}>
      <Container maxWidth="xl">
        <Box marginY={3}>
          <WrapperTypography variant="h2">{'New Space'}</WrapperTypography>
        </Box>
        <SpaceEditForm
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

export default NewSpace;
