import { FC, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import PageContent from '../../../../../core/ui/content/PageContent';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../../core/ui/content/PageContentBlockHeader';
import { BlockSectionTitle, Caption } from '../../../../../core/ui/typography';
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
import SeeMore from '../../../../../core/ui/content/SeeMore';

interface SpaceAccountPageProps {
  journeyId: string;
}

const SpaceAccountView: FC<SpaceAccountPageProps> = ({ journeyId }) => {
  const { t } = useTranslation();
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
  const avatar = hostOrganization?.profile.avatar?.uri;
  const location = hostOrganization?.profile.location;

  return (
    <PageContent background="transparent">
      {!loading && (
        <>
          <PageContentBlock columns={6}>
            <BlockSectionTitle>{t('pages.admin.generic.sections.account.urlTitle')}</BlockSectionTitle>
            <Caption>
              {ALKEMIO_DOMAIN}
              {spaceNameId}
            </Caption>
            <BlockSectionTitle marginTop={gutters(2)}>
              {t('pages.admin.generic.sections.account.visibilityTitle')}
            </BlockSectionTitle>
            <Caption>
              <Trans
                t={t}
                i18nKey="pages.admin.generic.sections.account.visibilityMode"
                values={{
                  mode: t(`common.enums.space-visibility.${license.visibility}` as const),
                }}
                components={{ strong: <strong /> }}
              />
            </Caption>
            <BlockSectionTitle marginTop={gutters(2)}>
              {t('pages.admin.generic.sections.account.hostTitle')}
            </BlockSectionTitle>
            <Box display="flex">
              {avatar && (
                <Box
                  component="img"
                  src={avatar}
                  maxHeight={gutters(2)}
                  maxWidth={gutters(2)}
                  borderRadius={theme => theme.spacing(0.6)}
                />
              )}
              <Box marginLeft={gutters(0.5)}>
                <Caption>{hostOrganization?.profile.displayName}</Caption>
                <Caption>
                  {location?.city && location?.city + ', '}
                  {location?.country && location?.country}
                </Caption>
              </Box>
            </Box>
            <SeeMore
              label="pages.admin.generic.sections.account.contactsLinkText"
              to={t('pages.admin.generic.sections.account.contactsLink')}
              sx={{ marginTop: gutters(2), textAlign: 'left' }}
            />
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
