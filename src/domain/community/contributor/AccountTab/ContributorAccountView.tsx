import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import { IconButton } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import { BlockTitle } from '../../../../core/ui/typography';
import JourneyCardHorizontal, {
  JourneyCardHorizontalSkeleton,
} from '../../../journey/common/JourneyCardHorizontal/JourneyCardHorizontal';
import Gutters from '../../../../core/ui/grid/Gutters';
import ContributorCardHorizontal from '../../../../core/ui/card/ContributorCardHorizontal';
import InnovationHubCardHorizontal, {
  InnovationHubCardHorizontalSkeleton,
} from '../../../innovationHub/InnovationHubCardHorizontal/InnovationHubCardHorizontal';
import { Actions } from '../../../../core/ui/actions/Actions';
import RoundedIcon from '../../../../core/ui/icon/RoundedIcon';
import CreateSpaceDialog from '../../../journey/space/createSpace/CreateSpaceDialog';
import useNewVirtualContributorWizard from '../../../../main/topLevelPages/myDashboard/newVirtualContributorWizard/useNewVirtualContributorWizard';
import CreateInnovationHubDialog from '../../../innovationHub/CreateInnovationHub/CreateInnovationHubDialog';
import { AuthorizationPrivilege, SpaceType, SpaceVisibility } from '../../../../core/apollo/generated/graphql-schema';
import { VIRTUAL_CONTRIBUTORS_LIMIT } from '../../../../main/topLevelPages/myDashboard/myAccount/MyAccountBlockVCCampaignUser';
import MenuItemWithIcon from '../../../../core/ui/menu/MenuItemWithIcon';
import { DeleteOutline } from '@mui/icons-material';
import {
  useDeleteInnovationHubMutation,
  useDeleteInnovationPackMutation,
  useDeleteSpaceMutation,
  useDeleteVirtualContributorOnAccountMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { useNotification } from '../../../../core/ui/notifications/useNotification';
import EntityConfirmDeleteDialog from '../../../journey/space/pages/SpaceSettings/EntityConfirmDeleteDialog';
import InnovationPackCardHorizontal, {
  InnovationPackCardHorizontalSkeleton,
} from '../../../InnovationPack/InnovationPackCardHorizontal/InnovationPackCardHorizontal';
import CreateInnovationPackDialog from '../../../InnovationPack/CreateInnovationPackDialog/CreateInnovationPackDialog';

export const SPACE_COUNT_LIMIT = 3;

const enum Entities {
  Space = 'Space',
  VirtualContributor = 'VirtualContributor',
  InnovationPack = 'InnovationPack',
  InnovationHub = 'InnovationHub',
}

const SHORT_NON_SPACE_DESCRIPTION = 'components.deleteEntity.confirmDialog.descriptionShort';

interface AccountProfile {
  id: string;
  displayName: string;
  description?: string;
  avatar?: { uri: string };
  url: string;
}

export interface ContributorAccountViewProps {
  accountHostName?: string;
  loading?: boolean;
  account?: {
    id: string;
    authorization?: { myPrivileges?: AuthorizationPrivilege[] };
    spaces: {
      id: string;
      level: number;
      profile: AccountProfile & {
        cardBanner?: { uri: string };
        tagline?: string;
      };
      community: { id: string };
      subspaces: {
        id: string;
        profile: AccountProfile & {
          cardBanner?: { uri: string };
        };
        community: { id: string };
        type: SpaceType;
      }[];
    }[];
    virtualContributors: {
      id: string;
      profile: AccountProfile & {
        tagline?: string;
      };
    }[];
    innovationPacks: {
      id: string;
      profile: AccountProfile;
      templates?: {
        calloutTemplatesCount: number;
        communityGuidelinesTemplatesCount: number;
        innovationFlowTemplatesCount: number;
        postTemplatesCount: number;
        whiteboardTemplatesCount: number;
      };
    }[];
    innovationHubs: {
      id: string;
      profile: AccountProfile & {
        banner?: { uri: string };
      };
      spaceVisibilityFilter?: SpaceVisibility;
      spaceListFilter?: {
        id: string;
        profile: {
          displayName: string;
        };
      }[];
      subdomain: string;
    }[];
  };
}

const useStyles = makeStyles(() => ({
  gutters: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
  },
}));

export const ContributorAccountView: FC<ContributorAccountViewProps> = ({ accountHostName, account, loading }) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { startWizard, NewVirtualContributorWizard } = useNewVirtualContributorWizard();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [entity, setSelectedEntity] = useState<Entities | undefined>(undefined);
  const styles = useStyles();

  const { virtualContributors, innovationPacks, innovationHubs } = useMemo(
    () => ({
      virtualContributors: account?.virtualContributors ?? [],
      innovationPacks: account?.innovationPacks ?? [],
      innovationHubs: account?.innovationHubs ?? [],
    }),
    [account]
  );

  const privileges = account?.authorization?.myPrivileges ?? [];
  const isPlatformAdmin = privileges.includes(AuthorizationPrivilege.PlatformAdmin);

  const isSpaceLimitReached = (account?.spaces?.length ?? 0) >= SPACE_COUNT_LIMIT;
  const canCreateSpace =
    privileges.includes(AuthorizationPrivilege.CreateSpace) && (!isSpaceLimitReached || isPlatformAdmin);
  const canCreateInnovationPack = privileges.includes(AuthorizationPrivilege.CreateInnovationPack);
  const canCreateInnovationHub = privileges.includes(AuthorizationPrivilege.CreateInnovationHub);
  const isVCLimitReached = virtualContributors.length >= VIRTUAL_CONTRIBUTORS_LIMIT;
  // TODO: Move to server logic
  const canCreateVirtualContributor =
    privileges.includes(AuthorizationPrivilege.CreateVirtualContributor) && (!isVCLimitReached || isPlatformAdmin);
  const canDeleteEntities = privileges.includes(AuthorizationPrivilege.Delete);

  const clearDeleteState = () => {
    setDeleteDialogOpen(false);
    setSelectedEntity(undefined);
    setSelectedId(undefined);
    setDeleteDialogOpen(false);
  };
  // Space deletion
  const [deleteSpaceMutation, { loading: deleteSpaceLoading }] = useDeleteSpaceMutation({
    onCompleted: () => {
      clearDeleteState();
      notify('Space deleted successfully!', 'success');
    },
    refetchQueries: ['AccountInformation'],
  });

  const deleteSpace = () => {
    if (!selectedId) {
      return;
    }

    deleteSpaceMutation({
      variables: {
        input: {
          ID: selectedId,
        },
      },
    });
  };

  const onDeleteSpaceClick = (spaceId: string) => {
    setSelectedEntity(Entities.Space);
    setSelectedId(spaceId);
    setDeleteDialogOpen(true);
  };

  // VC Deletion
  const [deleteVCMutation, { loading: deleteVCLoading }] = useDeleteVirtualContributorOnAccountMutation({
    onCompleted: () => {
      clearDeleteState();
      notify('Virtual Contributor deleted successfully!', 'success');
    },
    refetchQueries: ['AccountInformation'],
  });

  const deleteVC = () => {
    if (!selectedId) {
      return;
    }

    deleteVCMutation({
      variables: {
        virtualContributorData: {
          ID: selectedId,
        },
      },
    });
  };

  const onDeleteVCClick = (id: string) => {
    setSelectedEntity(Entities.VirtualContributor);
    setSelectedId(id);
    setDeleteDialogOpen(true);
  };

  // Pack Deletion
  const [deletePackMutation, { loading: deletePackLoading }] = useDeleteInnovationPackMutation({
    onCompleted: () => {
      clearDeleteState();
      notify('Innovation Pack deleted successfully!', 'success');
    },
    refetchQueries: ['AccountInformation'],
  });

  const deletePack = () => {
    if (!selectedId) {
      return;
    }

    deletePackMutation({
      variables: {
        innovationPackId: selectedId,
      },
    });
  };

  const onDeletePackClick = (id: string) => {
    setSelectedEntity(Entities.InnovationPack);
    setSelectedId(id);
    setDeleteDialogOpen(true);
  };

  // Hub Deletion
  const [deleteHubMutation, { loading: deleteHubLoading }] = useDeleteInnovationHubMutation({
    onCompleted: () => {
      clearDeleteState();
      notify('Innovation Hub deleted successfully!', 'success');
    },
    refetchQueries: ['AccountInformation'],
  });

  const deleteHub = () => {
    if (!selectedId) {
      return;
    }

    deleteHubMutation({
      variables: {
        innovationHubId: selectedId,
      },
    });
  };

  const onDeleteHubClick = (id: string) => {
    setSelectedEntity(Entities.InnovationHub);
    setSelectedId(id);
    setDeleteDialogOpen(true);
  };

  const deleteEntity = () => {
    switch (entity) {
      case Entities.Space:
        deleteSpace();
        break;
      case Entities.VirtualContributor:
        deleteVC();
        break;
      case Entities.InnovationPack:
        deletePack();
        break;
      case Entities.InnovationHub:
        deleteHub();
        break;
    }
  };

  const getEntityName = (entity: Entities | undefined) => {
    switch (entity) {
      case Entities.VirtualContributor:
        return t('common.virtual-contributor');
      case Entities.InnovationPack:
        return t('common.innovationPack');
      case Entities.InnovationHub:
        return t('common.innovation-hub');
      case Entities.Space:
      default:
        return t('common.space');
    }
  };

  const getSpaceActions = (id: string) =>
    canDeleteEntities && (
      <MenuItemWithIcon
        key="delete"
        disabled={deleteSpaceLoading}
        iconComponent={DeleteOutline}
        onClick={() => onDeleteSpaceClick(id)}
      >
        {t('buttons.delete')}
      </MenuItemWithIcon>
    );

  const getVCActions = (id: string) =>
    canDeleteEntities && (
      <MenuItemWithIcon
        key="delete"
        disabled={deleteVCLoading}
        iconComponent={DeleteOutline}
        onClick={() => onDeleteVCClick(id)}
      >
        {t('buttons.delete')}
      </MenuItemWithIcon>
    );

  const getPackActions = (id: string) =>
    canDeleteEntities && (
      <MenuItemWithIcon
        key="delete"
        disabled={deletePackLoading}
        iconComponent={DeleteOutline}
        onClick={() => onDeletePackClick(id)}
      >
        {t('buttons.delete')}
      </MenuItemWithIcon>
    );

  const getHubActions = (id: string) =>
    canDeleteEntities && (
      <MenuItemWithIcon
        key="delete"
        disabled={deleteHubLoading}
        iconComponent={DeleteOutline}
        onClick={() => onDeleteHubClick(id)}
      >
        {t('buttons.delete')}
      </MenuItemWithIcon>
    );

  return (
    <PageContentColumn columns={12}>
      <PageContentBlock halfWidth>
        <BlockTitle>{t('pages.admin.generic.sections.account.hostedSpaces')}</BlockTitle>
        <Gutters disablePadding disableGap className={styles.gutters}>
          {loading && <JourneyCardHorizontalSkeleton />}
          <Gutters disablePadding>
            {!loading &&
              account?.spaces.map(space => (
                <JourneyCardHorizontal
                  key={space.id}
                  journeyTypeName="space"
                  journey={{ profile: space.profile, community: {} }}
                  size="medium"
                  deepness={0}
                  seamless
                  sx={{ display: 'inline-block', maxWidth: '100%', padding: 0 }}
                  actions={getSpaceActions(space.id)}
                  whitHoverState={false}
                />
              ))}
          </Gutters>
        </Gutters>
        <Actions>
          {canCreateSpace && (
            <>
              <IconButton
                aria-label={t('common.add')}
                aria-haspopup="true"
                size="small"
                onClick={() => setCreateDialogOpen(true)}
              >
                <RoundedIcon component={AddIcon} size="medium" iconSize="small" />
              </IconButton>
              {createDialogOpen && (
                <CreateSpaceDialog
                  redirectOnComplete={false}
                  onClose={() => setCreateDialogOpen(false)}
                  account={{ id: account?.id, name: accountHostName }}
                />
              )}
            </>
          )}
        </Actions>
      </PageContentBlock>
      <PageContentBlock halfWidth>
        <BlockTitle>{t('pages.admin.generic.sections.account.virtualContributors')}</BlockTitle>
        <Gutters disablePadding className={styles.gutters}>
          {loading && <JourneyCardHorizontalSkeleton />}
          <Gutters disablePadding>
            {!loading &&
              virtualContributors?.map(vc => (
                <ContributorCardHorizontal
                  key={vc.id}
                  profile={vc.profile}
                  seamless
                  menuActions={getVCActions(vc.id)}
                />
              ))}
          </Gutters>
          <Actions>
            {canCreateVirtualContributor && (
              <IconButton
                aria-label={t('common.add')}
                aria-haspopup="true"
                size="small"
                onClick={() => startWizard(account)}
              >
                <RoundedIcon component={AddIcon} size="medium" iconSize="small" />
              </IconButton>
            )}
          </Actions>
          <NewVirtualContributorWizard />
        </Gutters>
      </PageContentBlock>
      <PageContentBlock halfWidth>
        <BlockTitle>{t('pages.admin.generic.sections.account.innovationPacks')}</BlockTitle>
        <Gutters disablePadding className={styles.gutters}>
          {loading && <InnovationPackCardHorizontalSkeleton />}
          {!loading &&
            innovationPacks?.map(pack => (
              <InnovationPackCardHorizontal key={pack.id} {...pack} actions={getPackActions(pack.id)} />
            ))}
          <Actions>
            {canCreateInnovationPack && account?.id && <CreateInnovationPackDialog accountId={account?.id} />}
          </Actions>
        </Gutters>
      </PageContentBlock>
      <PageContentBlock halfWidth>
        <BlockTitle>{t('pages.admin.generic.sections.account.customHomepages')}</BlockTitle>
        <Gutters disablePadding className={styles.gutters}>
          {loading && <InnovationHubCardHorizontalSkeleton />}
          {!loading &&
            innovationHubs?.map(hub => (
              <InnovationHubCardHorizontal key={hub.id} {...hub} actions={getHubActions(hub.id)} />
            ))}
          <Actions>
            {canCreateInnovationHub && account?.id && (
              <CreateInnovationHubDialog accountId={account?.id} accountHostName={accountHostName} />
            )}
          </Actions>
        </Gutters>
        {deleteDialogOpen && (
          <EntityConfirmDeleteDialog
            entity={getEntityName(entity)}
            open={deleteDialogOpen}
            onClose={clearDeleteState}
            onDelete={deleteEntity}
            submitting={deleteSpaceLoading || deletePackLoading || deleteVCLoading}
            description={entity === Entities.Space ? undefined : SHORT_NON_SPACE_DESCRIPTION}
          />
        )}
      </PageContentBlock>
    </PageContentColumn>
  );
};

export default ContributorAccountView;
