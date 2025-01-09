import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import { Box, IconButton, Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { BlockTitle, Caption, Text } from '@/core/ui/typography';
import JourneyCardHorizontal, {
  JourneyCardHorizontalSkeleton,
} from '@/domain/journey/common/JourneyCardHorizontal/JourneyCardHorizontal';
import Gutters from '@/core/ui/grid/Gutters';
import ContributorCardHorizontal from '@/core/ui/card/ContributorCardHorizontal';
import InnovationHubCardHorizontal, {
  InnovationHubCardHorizontalSkeleton,
} from '@/domain/innovationHub/InnovationHubCardHorizontal/InnovationHubCardHorizontal';
import { Actions } from '@/core/ui/actions/Actions';
import RoundedIcon from '@/core/ui/icon/RoundedIcon';
import CreateSpaceDialog from '@/domain/journey/space/createSpace/CreateSpaceDialog';
import useNewVirtualContributorWizard from '@/main/topLevelPages/myDashboard/newVirtualContributorWizard/useNewVirtualContributorWizard';
import CreateInnovationHubDialog from '@/domain/innovationHub/CreateInnovationHub/CreateInnovationHubDialog';
import {
  AuthorizationPrivilege,
  LicenseEntitlement,
  LicenseEntitlementType,
  SpaceLevel,
  SpaceType,
  SpaceVisibility,
} from '@/core/apollo/generated/graphql-schema';
import MenuItemWithIcon from '@/core/ui/menu/MenuItemWithIcon';
import { DeleteOutline } from '@mui/icons-material';
import {
  useDeleteInnovationHubMutation,
  useDeleteInnovationPackMutation,
  useDeleteSpaceMutation,
  useDeleteVirtualContributorOnAccountMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { useNotification } from '@/core/ui/notifications/useNotification';
import EntityConfirmDeleteDialog from '@/domain/journey/space/pages/SpaceSettings/EntityConfirmDeleteDialog';
import InnovationPackCardHorizontal, {
  InnovationPackCardHorizontalSkeleton,
} from '@/domain/InnovationPack/InnovationPackCardHorizontal/InnovationPackCardHorizontal';
import CreateInnovationPackDialog from '@/domain/InnovationPack/CreateInnovationPackDialog/CreateInnovationPackDialog';

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

export interface AccountTabResourcesProps {
  id: string;
  externalSubscriptionID?: string;
  authorization?: { myPrivileges?: AuthorizationPrivilege[] };
  license?: {
    id: string;
    availableEntitlements?: LicenseEntitlementType[];
    entitlements?: Pick<LicenseEntitlement, 'type' | 'limit' | 'usage'>[];
  };
  spaces: {
    id: string;
    level: SpaceLevel;
    profile: AccountProfile & {
      cardBanner?: { uri: string };
      tagline?: string;
    };
    community: {
      id: string;
      roleSet: {
        id: string;
      };
    };
    license: {
      id: string;
      availableEntitlements?: LicenseEntitlementType[];
    };
    subspaces: {
      id: string;
      profile: AccountProfile & {
        cardBanner?: { uri: string };
      };
      community: {
        id: string;
        roleSet: {
          id: string;
        };
      };
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
      collaborationTemplatesCount: number;
      communityGuidelinesTemplatesCount: number;
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
}

export interface ContributorAccountViewProps {
  accountHostName?: string;
  loading?: boolean;
  account?: AccountTabResourcesProps;
}

const useStyles = makeStyles(() => ({
  gutters: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
  },
  guttersRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: '100%',
  },
}));

export const ContributorAccountView = ({ accountHostName, account, loading }: ContributorAccountViewProps) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { startWizard, NewVirtualContributorWizard } = useNewVirtualContributorWizard();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [entity, setSelectedEntity] = useState<Entities | undefined>(undefined);
  const styles = useStyles();
  const myAccountEntitlements = account?.license?.availableEntitlements || [];
  const myAccountEntitlementDetails = account?.license?.entitlements || [];
  const externalSubscriptionID = account?.externalSubscriptionID;

  const isEntitledToCreateSpace = [
    LicenseEntitlementType.AccountSpaceFree,
    LicenseEntitlementType.AccountSpacePlus,
    LicenseEntitlementType.AccountSpacePremium,
  ].some(entitlement => myAccountEntitlements.includes(entitlement));

  const isEntitledToCreateInnovationPack = myAccountEntitlements.includes(LicenseEntitlementType.AccountInnovationPack);
  const isEntitledToCreateInnovationHub = myAccountEntitlements.includes(LicenseEntitlementType.AccountInnovationHub);
  const isEntitledToCreateVC = myAccountEntitlements.includes(LicenseEntitlementType.AccountVirtualContributor);

  const { virtualContributors, innovationPacks, innovationHubs } = useMemo(
    () => ({
      virtualContributors: account?.virtualContributors ?? [],
      innovationPacks: account?.innovationPacks ?? [],
      innovationHubs: account?.innovationHubs ?? [],
    }),
    [account]
  );

  const privileges = account?.authorization?.myPrivileges ?? [];
  // const isPlatformAdmin = privileges.includes(AuthorizationPrivilege.PlatformAdmin);
  const isPlatformAdmin = false;

  const canCreateSpace = privileges.includes(AuthorizationPrivilege.CreateSpace) || isPlatformAdmin;
  const canCreateInnovationPack = privileges.includes(AuthorizationPrivilege.CreateInnovationPack) || isPlatformAdmin;
  const canCreateInnovationHub = privileges.includes(AuthorizationPrivilege.CreateInnovationHub) || isPlatformAdmin;
  const canCreateVirtualContributor =
    privileges.includes(AuthorizationPrivilege.CreateVirtualContributor) || isPlatformAdmin;

  const canDeleteEntities = privileges.includes(AuthorizationPrivilege.Delete);

  const { limit: hostedSpaceLimit = 0, usage: hostedSpaceUsage = 0 } =
    myAccountEntitlementDetails.find(
      entitlement =>
        entitlement.type === LicenseEntitlementType.AccountSpaceFree ||
        entitlement.type === LicenseEntitlementType.AccountSpacePlus ||
        entitlement.type === LicenseEntitlementType.AccountSpacePremium
    ) ?? {};

  const { limit: vcLimit = 0, usage: vcUsage = 0 } =
    myAccountEntitlementDetails.find(
      entitlement => entitlement.type === LicenseEntitlementType.AccountVirtualContributor
    ) ?? {};

  const { limit: innovationPackLimit = 0, usage: innovationPackUsage = 0 } =
    myAccountEntitlementDetails.find(
      entitlement => entitlement.type === LicenseEntitlementType.AccountInnovationPack
    ) ?? {};

  const { limit: innovationHubLimit = 0, usage: innovationHubUsage = 0 } =
    myAccountEntitlementDetails.find(entitlement => entitlement.type === LicenseEntitlementType.AccountInnovationHub) ??
    {};

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
      notify(t('pages.admin.generic.sections.account.deletedSuccessfully', { entity: t('common.space') }), 'success');
    },
    refetchQueries: ['AccountInformation'],
  });

  const deleteSpace = () => {
    if (!selectedId) {
      return;
    }

    return deleteSpaceMutation({
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
      notify(
        t('pages.admin.generic.sections.account.deletedSuccessfully', { entity: t('common.virtual-contributor') }),
        'success'
      );
    },
    refetchQueries: ['AccountInformation'],
  });

  const deleteVC = () => {
    if (!selectedId) {
      return;
    }

    return deleteVCMutation({
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
      notify(
        t('pages.admin.generic.sections.account.deletedSuccessfully', { entity: t('common.innovationPack') }),
        'success'
      );
    },
    refetchQueries: ['AccountInformation'],
  });

  const deletePack = () => {
    if (!selectedId) {
      return;
    }

    return deletePackMutation({
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
      notify(
        t('pages.admin.generic.sections.account.deletedSuccessfully', { entity: t('common.innovation-hub') }),
        'success'
      );
    },
    refetchQueries: ['AccountInformation'],
  });

  const deleteHub = () => {
    if (!selectedId) {
      return;
    }

    return deleteHubMutation({
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
        return deleteSpace();
      case Entities.VirtualContributor:
        return deleteVC();
      case Entities.InnovationPack:
        return deletePack();
      case Entities.InnovationHub:
        return deleteHub();
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
        <Gutters disablePadding disableGap className={styles.guttersRow}>
          <BlockTitle>{t('pages.admin.generic.sections.account.hostedSpaces')}</BlockTitle>
          <TextWithTooltip
            text={`${hostedSpaceUsage}/${hostedSpaceLimit}`}
            tooltip={t('pages.admin.generic.sections.account.usageNotice', {
              type: t('pages.admin.generic.sections.account.virtualContributors'),
              usage: hostedSpaceUsage,
              limit: hostedSpaceLimit,
            })}
          />
        </Gutters>

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
                  disableHoverState
                />
              ))}
          </Gutters>
        </Gutters>
        <Actions justifyContent="end">
          {canCreateSpace && (
            <>
              <CreationButton
                disabled={!isEntitledToCreateSpace}
                onClick={() => setCreateDialogOpen(true)}
                tooltip={t('pages.admin.generic.sections.account.usageNotice', {
                  type: t('pages.admin.generic.sections.account.hostedSpaces'),
                  usage: hostedSpaceUsage,
                  limit: hostedSpaceLimit,
                })}
              />
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
        <Gutters disablePadding disableGap className={styles.guttersRow}>
          <BlockTitle>{t('pages.admin.generic.sections.account.virtualContributors')}</BlockTitle>
          <TextWithTooltip
            text={`${vcUsage}/${vcLimit}`}
            tooltip={t('pages.admin.generic.sections.account.usageNotice', {
              type: t('pages.admin.generic.sections.account.virtualContributors'),
              usage: vcUsage,
              limit: vcLimit,
            })}
          />
        </Gutters>
        <Gutters disablePadding className={styles.gutters}>
          {loading && <JourneyCardHorizontalSkeleton />}
          <Gutters disablePadding>
            {!loading &&
              virtualContributors?.map(vc => (
                <ContributorCardHorizontal
                  key={vc.id}
                  profile={vc.profile}
                  seamless
                  withUnifiedTitle
                  menuActions={getVCActions(vc.id)}
                />
              ))}
          </Gutters>
          <Actions justifyContent="end">
            {canCreateVirtualContributor && (
              <CreationButton
                disabled={!isEntitledToCreateVC}
                onClick={() => startWizard(account)}
                tooltip={t('pages.admin.generic.sections.account.usageNotice', {
                  type: t('pages.admin.generic.sections.account.virtualContributors'),
                  usage: vcUsage,
                  limit: vcLimit,
                })}
              />
            )}
          </Actions>
          <NewVirtualContributorWizard />
        </Gutters>
      </PageContentBlock>
      <PageContentBlock halfWidth>
        <Gutters disablePadding disableGap className={styles.guttersRow}>
          <BlockTitle>{t('pages.admin.generic.sections.account.innovationPacks')}</BlockTitle>
          <TextWithTooltip
            text={`${innovationPackUsage}/${innovationPackLimit}`}
            tooltip={t('pages.admin.generic.sections.account.usageNotice', {
              type: t('pages.admin.generic.sections.account.innovationPacks'),
              usage: innovationPackUsage,
              limit: innovationPackLimit,
            })}
          />
        </Gutters>
        <Gutters disablePadding className={styles.gutters}>
          {loading && <InnovationPackCardHorizontalSkeleton />}
          {!loading &&
            innovationPacks?.map(pack => (
              <InnovationPackCardHorizontal key={pack.id} {...pack} actions={getPackActions(pack.id)} />
            ))}
          <Actions justifyContent="end">
            {/*extract the buttons from the dialogs*/}
            {canCreateInnovationPack && account?.id && (
              <CreateInnovationPackDialog accountId={account?.id} disabled={!isEntitledToCreateInnovationPack} />
            )}
          </Actions>
        </Gutters>
      </PageContentBlock>
      <PageContentBlock halfWidth>
        <Gutters disablePadding disableGap className={styles.guttersRow}>
          <BlockTitle>{t('pages.admin.generic.sections.account.customHomepages')}</BlockTitle>
          <TextWithTooltip
            text={`${innovationHubUsage}/${innovationHubLimit}`}
            tooltip={t('pages.admin.generic.sections.account.usageNotice', {
              type: t('pages.admin.generic.sections.account.customHomepages'),
              usage: innovationHubUsage,
              limit: innovationHubLimit,
            })}
          />
        </Gutters>
        <Gutters disablePadding className={styles.gutters}>
          {loading && <InnovationHubCardHorizontalSkeleton />}
          {!loading &&
            innovationHubs?.map(hub => (
              <InnovationHubCardHorizontal key={hub.id} {...hub} actions={getHubActions(hub.id)} />
            ))}
          <Actions justifyContent="end">
            {canCreateInnovationHub && account?.id && (
              <CreateInnovationHubDialog
                accountId={account?.id}
                accountHostName={accountHostName}
                disabled={!isEntitledToCreateInnovationHub}
              />
            )}
          </Actions>
        </Gutters>
        {deleteDialogOpen && (
          <EntityConfirmDeleteDialog
            entity={getEntityName(entity)}
            open={deleteDialogOpen}
            onClose={clearDeleteState}
            onDelete={deleteEntity}
            description={entity === Entities.Space ? undefined : SHORT_NON_SPACE_DESCRIPTION}
          />
        )}
      </PageContentBlock>
      {externalSubscriptionID && <Caption>Wingback id: {externalSubscriptionID}</Caption>}
    </PageContentColumn>
  );
};

export default ContributorAccountView;

const TextWithTooltip = ({ text, tooltip }: { text: string; tooltip: string }) => {
  return (
    <Tooltip arrow title={<Caption>{tooltip}</Caption>} placement="top">
      <Text>{text}</Text>
    </Tooltip>
  );
};

const CreationButton = ({
  tooltip,
  disabled,
  onClick,
}: {
  tooltip: string;
  onClick: () => void;
  disabled?: boolean;
}) => {
  const { t } = useTranslation();

  const button = (
    <IconButton
      aria-label={t('common.add')}
      aria-disabled={disabled}
      aria-haspopup="true"
      size="small"
      onClick={onClick}
      disabled={disabled}
    >
      <RoundedIcon component={AddIcon} size="medium" iconSize="small" disabled={disabled} aria-disabled={disabled} />
    </IconButton>
  );

  return disabled ? (
    <Tooltip arrow placement="top" title={tooltip}>
      <Box>{button}</Box>
    </Tooltip>
  ) : (
    { button }
  );
};
