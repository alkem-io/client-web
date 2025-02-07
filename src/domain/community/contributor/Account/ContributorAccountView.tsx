import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { BlockTitle, Caption } from '@/core/ui/typography';
import JourneyCardHorizontal, {
  JourneyCardHorizontalSkeleton,
} from '@/domain/journey/common/JourneyCardHorizontal/JourneyCardHorizontal';
import Gutters from '@/core/ui/grid/Gutters';
import ContributorCardHorizontal from '@/core/ui/card/ContributorCardHorizontal';
import InnovationHubCardHorizontal, {
  InnovationHubCardHorizontalSkeleton,
} from '@/domain/innovationHub/InnovationHubCardHorizontal/InnovationHubCardHorizontal';
import { Actions } from '@/core/ui/actions/Actions';
import CreateSpaceDialog from '@/domain/journey/space/createSpace/CreateSpaceDialog';
import useVirtualContributorWizard from '@/main/topLevelPages/myDashboard/newVirtualContributorWizard/useVirtualContributorWizard';
import CreateInnovationHubDialog from '@/domain/innovationHub/CreateInnovationHub/CreateInnovationHubDialog';
import {
  AuthorizationPrivilege,
  LicenseEntitlement,
  LicenseEntitlementType,
  SpaceLevel,
  SpaceVisibility,
} from '@/core/apollo/generated/graphql-schema';
import MenuItemWithIcon from '@/core/ui/menu/MenuItemWithIcon';
import { DeleteOutline } from '@mui/icons-material';
import {
  useCreateWingbackAccountMutation,
  useDeleteInnovationHubMutation,
  useDeleteInnovationPackMutation,
  useDeleteSpaceMutation,
  useDeleteVirtualContributorOnAccountMutation,
} from '@/core/apollo/generated/apollo-hooks';
import CreationButton from '@/core/ui/button/CreationButton';
import TextWithTooltip from '@/core/ui/typography/TextWithTooltip';
import { useNotification } from '@/core/ui/notifications/useNotification';
import EntityConfirmDeleteDialog from '@/domain/journey/space/pages/SpaceSettings/EntityConfirmDeleteDialog';
import InnovationPackCardHorizontal, {
  InnovationPackCardHorizontalSkeleton,
} from '@/domain/InnovationPack/InnovationPackCardHorizontal/InnovationPackCardHorizontal';
import CreateInnovationPackDialog from '@/domain/InnovationPack/CreateInnovationPackDialog/CreateInnovationPackDialog';
import AddIcon from '@mui/icons-material/Add';
import RoundedIcon from '@/core/ui/icon/RoundedIcon';
import { IconButton } from '@mui/material';
import { LoadingButton } from '@mui/lab';

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

const BlockHeader = ({
  title,
  tooltip,
  usage,
  limit,
  isAvailable,
}: {
  title: string;
  tooltip: string;
  usage: number;
  limit: number;
  isAvailable: boolean;
}) => {
  const { t } = useTranslation();

  return (
    <Gutters disablePadding disableGap row justifyContent="space-between">
      <BlockTitle>{title}</BlockTitle>
      {isAvailable || usage > 0 ? (
        <TextWithTooltip text={`${usage}/${limit}`} tooltip={tooltip} />
      ) : (
        <TextWithTooltip
          text={t('pages.admin.generic.sections.account.notAvailable')}
          tooltip={t('pages.admin.generic.sections.account.notAvailableNotice')}
        />
      )}
    </Gutters>
  );
};

const StyledCreationButton = ({ disabled, onClick }: { disabled: boolean; onClick: () => void }) => {
  const { t } = useTranslation();

  return (
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
};

export const ContributorAccountView = ({ accountHostName, account, loading }: ContributorAccountViewProps) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { startWizard, VirtualContributorWizard } = useVirtualContributorWizard();
  const [createSpaceDialogOpen, setCreateSpaceDialogOpen] = useState(false);
  const [createInnovationHubDialogOpen, setCreateInnovationHubDialogOpen] = useState(false);
  const [createInnovationPackDialogOpen, setCreateInnovationPackDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [entity, setSelectedEntity] = useState<Entities | undefined>(undefined);

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

  const canCreateWingbackAccount = privileges.includes(AuthorizationPrivilege.AccountLicenseManage);
  const canCreateSpace = privileges.includes(AuthorizationPrivilege.CreateSpace);
  const canCreateInnovationPack = privileges.includes(AuthorizationPrivilege.CreateInnovationPack);
  const canCreateInnovationHub = privileges.includes(AuthorizationPrivilege.CreateInnovationHub);
  const canCreateVirtualContributor = privileges.includes(AuthorizationPrivilege.CreateVirtualContributor);

  const canDeleteEntities = privileges.includes(AuthorizationPrivilege.Delete);

  const enableWingbackAccountCreation = !loading && !externalSubscriptionID;

  // Temporarily we're ordering the priority in this way: Display usage/limit from FREE / PLUS / PREMIUM
  const { limit: hostedSpaceLimit = 0, usage: hostedSpaceUsage = 0 } =
    myAccountEntitlementDetails.find(entitlement => entitlement.type === LicenseEntitlementType.AccountSpaceFree) ??
    myAccountEntitlementDetails.find(entitlement => entitlement.type === LicenseEntitlementType.AccountSpacePlus) ??
    myAccountEntitlementDetails.find(entitlement => entitlement.type === LicenseEntitlementType.AccountSpacePremium) ??
    {};

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

  // Wingback account creation
  const [createWingbackAccount, { loading: isWingbackCreating }] = useCreateWingbackAccountMutation({
    onCompleted: () => {
      notify(t('pages.admin.generic.sections.account.externalSubAdded'), 'success');
    },
    onError: () => {
      notify(t('pages.admin.generic.sections.account.externalSubErrored'), 'error');
    },
    refetchQueries: ['AccountInformation'],
  });

  const onCreateWingbackAccountClick = () => {
    if (!account?.id) {
      return;
    }

    createWingbackAccount({
      variables: {
        accountID: account.id,
      },
    });
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
    <>
      <PageContentColumn columns={12} justifyContent="end">
        {canCreateWingbackAccount && (
          <CreationButton
            buttonComponent={
              <LoadingButton
                variant="contained"
                disabled={!enableWingbackAccountCreation}
                loading={isWingbackCreating}
                sx={{ textTransform: 'none', flexShrink: 1 }}
                onClick={onCreateWingbackAccountClick}
              >
                <Caption noWrap>{t('pages.admin.generic.sections.account.addExternalSub')}</Caption>
              </LoadingButton>
            }
            disabled={!enableWingbackAccountCreation}
            disabledTooltip={t('pages.admin.generic.sections.account.externalSubExists')}
          />
        )}
      </PageContentColumn>
      <PageContentColumn columns={12}>
        <PageContentBlock halfWidth>
          <BlockHeader
            title={t('pages.admin.generic.sections.account.hostedSpaces')}
            usage={hostedSpaceUsage}
            limit={hostedSpaceLimit}
            isAvailable={canCreateSpace}
            tooltip={t('pages.admin.generic.sections.account.usageNotice', {
              type: t('pages.admin.generic.sections.account.hostedSpaces'),
              usage: hostedSpaceUsage,
              limit: hostedSpaceLimit,
            })}
          />
          <Gutters disablePadding disableGap justifyContent="space-between" fullHeight>
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
                  buttonComponent={
                    <StyledCreationButton
                      disabled={!isEntitledToCreateSpace}
                      onClick={() => setCreateSpaceDialogOpen(true)}
                    />
                  }
                  disabled={!isEntitledToCreateSpace}
                  disabledTooltip={t('pages.admin.generic.sections.account.limitNotice')}
                />
                {createSpaceDialogOpen && (
                  <CreateSpaceDialog
                    redirectOnComplete={false}
                    onClose={() => setCreateSpaceDialogOpen(false)}
                    account={{ id: account?.id, name: accountHostName }}
                  />
                )}
              </>
            )}
          </Actions>
        </PageContentBlock>
        <PageContentBlock halfWidth>
          <BlockHeader
            title={t('pages.admin.generic.sections.account.virtualContributors')}
            usage={vcUsage}
            limit={vcLimit}
            isAvailable={canCreateVirtualContributor}
            tooltip={t('pages.admin.generic.sections.account.usageNotice', {
              type: t('pages.admin.generic.sections.account.virtualContributors'),
              usage: vcUsage,
              limit: vcLimit,
            })}
          />
          <Gutters disablePadding justifyContent="space-between" fullHeight>
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
                  buttonComponent={
                    <StyledCreationButton
                      disabled={!isEntitledToCreateVC}
                      onClick={() => startWizard(account, accountHostName)}
                    />
                  }
                  disabled={!isEntitledToCreateVC}
                  disabledTooltip={t('pages.admin.generic.sections.account.limitNotice')}
                />
              )}
            </Actions>
            <VirtualContributorWizard />
          </Gutters>
        </PageContentBlock>
        <PageContentBlock halfWidth>
          <BlockHeader
            title={t('pages.admin.generic.sections.account.innovationPacks')}
            usage={innovationPackUsage}
            limit={innovationPackLimit}
            isAvailable={canCreateInnovationPack}
            tooltip={t('pages.admin.generic.sections.account.usageNotice', {
              type: t('pages.admin.generic.sections.account.innovationPacks'),
              usage: innovationPackUsage,
              limit: innovationPackLimit,
            })}
          />
          <Gutters disablePadding justifyContent="space-between" fullHeight>
            {loading && <InnovationPackCardHorizontalSkeleton />}
            {!loading &&
              innovationPacks?.map(pack => (
                <InnovationPackCardHorizontal key={pack.id} {...pack} actions={getPackActions(pack.id)} />
              ))}
            <Actions justifyContent="end">
              {canCreateInnovationPack && account?.id && (
                <>
                  <CreationButton
                    buttonComponent={
                      <StyledCreationButton
                        disabled={!isEntitledToCreateInnovationPack}
                        onClick={() => setCreateInnovationPackDialogOpen(true)}
                      />
                    }
                    disabled={!isEntitledToCreateInnovationPack}
                    disabledTooltip={t('pages.admin.generic.sections.account.limitNotice')}
                  />
                  <CreateInnovationPackDialog
                    accountId={account?.id}
                    open={createInnovationPackDialogOpen}
                    onClose={() => setCreateInnovationPackDialogOpen(false)}
                  />
                </>
              )}
            </Actions>
          </Gutters>
        </PageContentBlock>
        <PageContentBlock halfWidth>
          <BlockHeader
            title={t('pages.admin.generic.sections.account.customHomepages')}
            usage={innovationHubUsage}
            limit={innovationHubLimit}
            isAvailable={canCreateInnovationHub}
            tooltip={t('pages.admin.generic.sections.account.usageNotice', {
              type: t('pages.admin.generic.sections.account.customHomepages'),
              usage: innovationHubUsage,
              limit: innovationHubLimit,
            })}
          />
          <Gutters disablePadding justifyContent="space-between" fullHeight>
            {loading && <InnovationHubCardHorizontalSkeleton />}
            {!loading &&
              innovationHubs?.map(hub => (
                <InnovationHubCardHorizontal key={hub.id} {...hub} actions={getHubActions(hub.id)} />
              ))}
            <Actions justifyContent="end">
              {canCreateInnovationHub && account?.id && (
                <>
                  <CreationButton
                    buttonComponent={
                      <StyledCreationButton
                        disabled={!isEntitledToCreateInnovationHub}
                        onClick={() => setCreateInnovationHubDialogOpen(true)}
                      />
                    }
                    disabled={!isEntitledToCreateInnovationHub}
                    disabledTooltip={t('pages.admin.generic.sections.account.limitNotice')}
                  />
                  <CreateInnovationHubDialog
                    accountId={account.id}
                    accountHostName={accountHostName}
                    open={createInnovationHubDialogOpen}
                    onClose={() => setCreateInnovationHubDialogOpen(false)}
                  />
                </>
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
    </>
  );
};

export default ContributorAccountView;
