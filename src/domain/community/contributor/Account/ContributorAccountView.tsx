import {
  useDeleteInnovationHubMutation,
  useDeleteInnovationPackMutation,
  useDeleteSpaceMutation,
  useDeleteVirtualContributorOnAccountMutation,
} from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  LicenseEntitlement,
  LicenseEntitlementType,
  SpaceLevel,
  SpaceVisibility,
} from '@/core/apollo/generated/graphql-schema';
import { Actions } from '@/core/ui/actions/Actions';
import CreationButton from '@/core/ui/button/CreationButton';
import ContributorCardHorizontal from '@/core/ui/card/ContributorCardHorizontal';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import Gutters from '@/core/ui/grid/Gutters';
import MenuItemWithIcon from '@/core/ui/menu/MenuItemWithIcon';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { BlockTitle, Caption } from '@/core/ui/typography';
import TextWithTooltip from '@/core/ui/typography/TextWithTooltip';
import CreateInnovationPackDialog from '@/domain/InnovationPack/CreateInnovationPackDialog/CreateInnovationPackDialog';
import InnovationPackCardHorizontal, {
  InnovationPackCardHorizontalSkeleton,
} from '@/domain/InnovationPack/InnovationPackCardHorizontal/InnovationPackCardHorizontal';
import CreateInnovationHubDialog from '@/domain/innovationHub/CreateInnovationHub/CreateInnovationHubDialog';
import InnovationHubCardHorizontal, {
  InnovationHubCardHorizontalSkeleton,
} from '@/domain/innovationHub/InnovationHubCardHorizontal/InnovationHubCardHorizontal';
import JourneyCardHorizontal, {
  JourneyCardHorizontalSkeleton,
} from '@/domain/journey/common/JourneyCardHorizontal/JourneyCardHorizontal';
import CreateSpaceDialog from '@/domain/journey/space/createSpace/CreateSpaceDialog';
import EntityConfirmDeleteDialog from '@/domain/journey/space/pages/SpaceSettings/EntityConfirmDeleteDialog';
import useVirtualContributorWizard from '@/main/topLevelPages/myDashboard/newVirtualContributorWizard/useVirtualContributorWizard';
import { DeleteOutline } from '@mui/icons-material';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

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

  const canCreateSpace = privileges.includes(AuthorizationPrivilege.CreateSpace);
  const canCreateInnovationPack = privileges.includes(AuthorizationPrivilege.CreateInnovationPack);
  const canCreateInnovationHub = privileges.includes(AuthorizationPrivilege.CreateInnovationHub);
  const canCreateVirtualContributor = privileges.includes(AuthorizationPrivilege.CreateVirtualContributor);

  const canDeleteEntities = privileges.includes(AuthorizationPrivilege.Delete);

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
        <Gutters disablePadding disableGap row justifyContent="space-between">
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

        <Gutters disablePadding disableGap justifyContent="space-between" height="100%">
          {loading && <JourneyCardHorizontalSkeleton />}
          <Gutters disablePadding>
            {!loading &&
              account?.spaces.map(space => (
                <JourneyCardHorizontal
                  key={space.id}
                  journey={{ profile: space.profile, level: space.level, community: {} }}
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
                onClick={() => setCreateSpaceDialogOpen(true)}
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
        <Gutters disablePadding disableGap row justifyContent="space-between">
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
        <Gutters disablePadding justifyContent="space-between" height="100%">
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
                onClick={() => startWizard(account, accountHostName)}
                disabledTooltip={t('pages.admin.generic.sections.account.limitNotice')}
              />
            )}
          </Actions>
          <VirtualContributorWizard />
        </Gutters>
      </PageContentBlock>
      <PageContentBlock halfWidth>
        <Gutters disablePadding disableGap row justifyContent="space-between">
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
        <Gutters disablePadding justifyContent="space-between" height="100%">
          {loading && <InnovationPackCardHorizontalSkeleton />}
          {!loading &&
            innovationPacks?.map(pack => (
              <InnovationPackCardHorizontal key={pack.id} {...pack} actions={getPackActions(pack.id)} />
            ))}
          <Actions justifyContent="end">
            {canCreateInnovationPack && account?.id && (
              <>
                <CreationButton
                  disabled={!isEntitledToCreateInnovationPack}
                  onClick={() => setCreateInnovationPackDialogOpen(true)}
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
        <Gutters disablePadding disableGap row justifyContent="space-between">
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
        <Gutters disablePadding justifyContent="space-between" height="100%">
          {loading && <InnovationHubCardHorizontalSkeleton />}
          {!loading &&
            innovationHubs?.map(hub => (
              <InnovationHubCardHorizontal key={hub.id} {...hub} actions={getHubActions(hub.id)} />
            ))}
          <Actions justifyContent="end">
            {canCreateInnovationHub && account?.id && (
              <>
                <CreationButton
                  disabled={!isEntitledToCreateInnovationHub}
                  onClick={() => setCreateInnovationHubDialogOpen(true)}
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
  );
};

export default ContributorAccountView;
