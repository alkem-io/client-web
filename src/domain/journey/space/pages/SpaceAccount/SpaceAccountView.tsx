import { FC, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { buildOrganizationUrl } from '../../../../../main/routing/urlBuilders';
import PageContent from '../../../../../core/ui/content/PageContent';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../../core/ui/content/PageContentBlockHeader';
import SeeMore from '../../../../../core/ui/content/SeeMore';
import { BlockTitle, Caption } from '../../../../../core/ui/typography';
import { useNotification } from '../../../../../core/ui/notifications/useNotification';
import ContributorCardHorizontal from '../../../../../core/ui/card/ContributorCardHorizontal';
import Gutters from '../../../../../core/ui/grid/Gutters';
import { AuthorizationPrivilege } from '../../../../../core/apollo/generated/graphql-schema';
import {
  refetchAdminSpacesListQuery,
  useDeleteSpaceMutation,
  useSpaceHostQuery,
  useSpacePrivilegesQuery,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { gutters } from '../../../../../core/ui/grid/utils';
import { ROUTE_HOME } from '../../../../platform/routes/constants';
import { useSpace } from '../../SpaceContext/useSpace';
import { DeleteIcon } from '../SpaceSettings/icon/DeleteIcon';
import SpaceProfileDeleteDialog from '../SpaceSettings/SpaceProfileDeleteDialog';

interface SpaceAccountPageProps {
  journeyId: string;
}

const SpaceAccountView: FC<SpaceAccountPageProps> = ({ journeyId }) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const navigate = useNavigate();

  const errorColor = '#940000';

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const openDialog = () => setOpenDeleteDialog(true);
  const closeDialog = () => setOpenDeleteDialog(false);

  const { spaceId, spaceNameId, license } = useSpace();

  const { data: hostOrganizationData, loading: hostOrganizationLoading } = useSpaceHostQuery({
    variables: { spaceNameId: journeyId },
  });
  const hostOrganization = hostOrganizationData?.space.account.host;

  const { data: spacePriviledges, loading: spacePriviledgesLoading } = useSpacePrivilegesQuery({
    variables: {
      spaceId: spaceId,
    },
    skip: !spaceId,
  });

  const [deleteSpace, { loading: deletingSpace }] = useDeleteSpaceMutation({
    refetchQueries: [refetchAdminSpacesListQuery()],
    awaitRefetchQueries: true,
    onCompleted: data => {
      notify(t('pages.admin.space.notifications.space-removed', { name: data.deleteSpace.nameID }), 'success');
      navigate(ROUTE_HOME, { replace: true });
    },
  });

  const privileges = spacePriviledges?.lookup.space?.authorization?.myPrivileges ?? [];
  const canDelete = privileges?.includes(AuthorizationPrivilege.Delete);

  const handleDelete = (id: string) => {
    deleteSpace({
      variables: {
        input: {
          ID: id,
        },
      },
    });
  };

  const ALKEMIO_DOMAIN = 'https://alkem.io/';
  const loading = deletingSpace && spacePriviledgesLoading && hostOrganizationLoading;

  return (
    <PageContent background="transparent">
      {!loading && (
        <>
          <PageContentBlock columns={6} sx={{ gap: gutters(2) }}>
            <Gutters disablePadding>
              <BlockTitle>{t('common.url')}</BlockTitle>
              <Caption>
                {ALKEMIO_DOMAIN}
                {spaceNameId}
              </Caption>
            </Gutters>
            <Gutters disablePadding>
              <BlockTitle>{t('common.visibility')}</BlockTitle>
              <Caption>
                <Trans
                  t={t}
                  i18nKey="components.editSpaceForm.visibility"
                  values={{
                    visibility: t(`common.enums.space-visibility.${license.visibility}` as const),
                  }}
                  components={{ strong: <strong /> }}
                />
              </Caption>
            </Gutters>
            <Gutters disablePadding>
              <BlockTitle>{t('pages.admin.generic.sections.account.hostTitle')}</BlockTitle>
              <ContributorCardHorizontal
                profile={{
                  displayName: hostOrganization?.profile.displayName || '',
                  avatar: hostOrganization?.profile.avatar,
                  location: hostOrganization?.profile.location,
                  tagsets: undefined,
                }}
                url={(hostOrganization?.nameID && buildOrganizationUrl(hostOrganization?.nameID)) || ''}
                seamless
              />
            </Gutters>
            <Gutters disablePadding>
              <SeeMore
                label="pages.admin.generic.sections.account.contactsLinkText"
                to={t('pages.admin.generic.sections.account.contactsLink')}
                sx={{ textAlign: 'left' }}
              />
            </Gutters>
          </PageContentBlock>
          {canDelete && (
            <PageContentBlock sx={{ borderColor: errorColor }}>
              <PageContentBlockHeader sx={{ color: errorColor }} title={t('components.deleteSpace.title')} />
              <Box display="flex" gap={1} alignItems="center" sx={{ cursor: 'pointer' }} onClick={openDialog}>
                <DeleteIcon />
                <Caption>{t('components.deleteSpace.description', { entity: t('common.space') })}</Caption>
              </Box>
            </PageContentBlock>
          )}
          {openDeleteDialog && (
            <SpaceProfileDeleteDialog
              entity={t('common.space')}
              open={openDeleteDialog}
              onClose={closeDialog}
              onDelete={() => handleDelete(journeyId)}
              submitting={deletingSpace}
            />
          )}
        </>
      )}
      {loading && (
        <Box marginX="auto">
          {' '}
          <CircularProgress />{' '}
        </Box>
      )}
    </PageContent>
  );
};

export default SpaceAccountView;
