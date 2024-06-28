import React, { FC, useMemo } from 'react';
import { Box, Container } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SpaceEditForm, { SpaceEditFormValuesType } from '../../../../journey/space/spaceEditForm/SpaceEditForm';
import WrapperTypography from '../../../../../core/ui/typography/deprecated/WrapperTypography';
import AdminLayout from '../../layout/toplevel/AdminLayout';
import { AdminSection } from '../../layout/toplevel/constants';
import { useNotification } from '../../../../../core/ui/notifications/useNotification';
import {
  refetchMyAccountQuery,
  useCreateAccountMutation,
  useOrganizationsListQuery,
  useSpaceUrlLazyQuery,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { PageProps } from '../../../../shared/types/PageProps';
import { formatDatabaseLocation } from '../../../../common/location/LocationUtils';
import useNavigate from '../../../../../core/routing/useNavigate';

interface NewSpaceProps extends PageProps {}

export const NewSpace: FC<NewSpaceProps> = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const notify = useNotification();
  const { data: organizationList } = useOrganizationsListQuery();

  const [spaceUrlQuery] = useSpaceUrlLazyQuery();

  const [createAccount, { loading }] = useCreateAccountMutation({
    refetchQueries: [refetchMyAccountQuery()],
    onCompleted: async data => {
      const spaceId = data.createAccount.spaceID;
      const spaceWithUrl = await spaceUrlQuery({ variables: { spaceNameId: spaceId } });
      const url = spaceWithUrl.data?.space.profile.url;

      if (!url) {
        notify(t('pages.admin.space.notifications.space-created'), 'error');
        return;
      }
      notify(t('pages.admin.space.notifications.space-created'), 'success');
      navigate(url);
    },
  });

  const organizations = useMemo(
    () => organizationList?.organizations.map(e => ({ id: e.id, name: e.profile.displayName })) || [],
    [organizationList]
  );

  const onSubmit = async (values: SpaceEditFormValuesType) => {
    const { name, nameID, hostId, tagsets } = values;

    await createAccount({
      variables: {
        input: {
          hostID: hostId,
          spaceData: {
            nameID,
            profileData: {
              displayName: name,
              tagline: values.tagline,
              location: formatDatabaseLocation(values.location),
            },
            tags: tagsets.flatMap(x => x.tags),
          },
        },
      },
    });
  };

  return (
    <AdminLayout currentTab={AdminSection.Space}>
      <Container maxWidth="xl">
        <Box marginY={3}>
          <WrapperTypography variant="h2">{'New Space'}</WrapperTypography>
        </Box>
        <SpaceEditForm onSubmit={onSubmit} organizations={organizations} loading={loading} />
      </Container>
    </AdminLayout>
  );
};

export default NewSpace;
