import { DeleteOutline, SettingsOutlined } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import { Button, IconButton, Link } from '@mui/material';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import {
  AuthorizationPrivilege,
  type LicenseEntitlement,
  LicenseEntitlementType,
  type SpaceLevel,
} from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import { Actions } from '@/core/ui/actions/Actions';
import CreationButton from '@/core/ui/button/CreationButton';
import ContributorCardHorizontal from '@/core/ui/card/ContributorCardHorizontal';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import Gutters from '@/core/ui/grid/Gutters';
import RoundedIcon from '@/core/ui/icon/RoundedIcon';
import MenuItemWithIcon from '@/core/ui/menu/MenuItemWithIcon';
import { BlockTitle, Caption } from '@/core/ui/typography';
import TextWithTooltip from '@/core/ui/typography/TextWithTooltip';
import type { Identifiable } from '@/core/utils/Identifiable';
import CreateInnovationPackDialog from '@/domain/InnovationPack/CreateInnovationPackDialog/CreateInnovationPackDialog';
import InnovationPackCardHorizontal, {
  InnovationPackCardHorizontalSkeleton,
} from '@/domain/InnovationPack/InnovationPackCardHorizontal/InnovationPackCardHorizontal';
import CreateInnovationHubDialog from '@/domain/innovationHub/CreateInnovationHub/CreateInnovationHubDialog';
import InnovationHubCardHorizontal, {
  InnovationHubCardHorizontalSkeleton,
} from '@/domain/innovationHub/InnovationHubCardHorizontal/InnovationHubCardHorizontal';
import { useConfig } from '@/domain/platform/config/useConfig';
import EntityConfirmDeleteDialog from '@/domain/shared/components/EntityConfirmDeleteDialog';
import CreateSpace from '@/domain/space/components/CreateSpace/createSpace/CreateSpace';
import SpaceCardHorizontal, { SpaceCardHorizontalSkeleton } from '@/domain/space/components/cards/SpaceCardHorizontal';
import useVirtualContributorWizard from '@/main/topLevelPages/myDashboard/newVirtualContributorWizard/useVirtualContributorWizard';
import { AccountEntityType, useAccountEntityDeletion } from './useAccountEntityDeletion';

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
    about: {
      id: string;
      profile: AccountProfile & {
        cardBanner?: { uri: string };
        tagline?: string;
      };
    };
    license: {
      availableEntitlements?: LicenseEntitlementType[];
    };
  }[];
  virtualContributors: {
    id: string;
    profile?: AccountProfile & {
      tagline?: string;
    };
  }[];
  innovationPacks: {
    id: string;
    profile: AccountProfile;
    templates?: {
      calloutTemplatesCount: number;
      spaceTemplatesCount: number;
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
    <Gutters disablePadding={true} disableGap={true} row={true} justifyContent="space-between">
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
  const navigate = useNavigate();
  const { locations } = useConfig();
  const supportLink = locations?.support;
  const { startWizard, VirtualContributorWizard } = useVirtualContributorWizard();
  const [createSpaceDialogOpen, setCreateSpaceDialogOpen] = useState(false);
  const [createInnovationHubDialogOpen, setCreateInnovationHubDialogOpen] = useState(false);
  const [createInnovationPackDialogOpen, setCreateInnovationPackDialogOpen] = useState(false);

  const {
    deleteDialogOpen,
    entity,
    clearDeleteState,
    openDeleteDialog,
    deleteEntity,
    getEntityName,
    deleteSpaceLoading,
    deleteVCLoading,
    deletePackLoading,
    deleteHubLoading,
    isWingbackCreating,
    onCreateWingbackAccount,
  } = useAccountEntityDeletion(account?.id);

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

  const { virtualContributors, innovationPacks, innovationHubs } = {
    virtualContributors: account?.virtualContributors ?? [],
    innovationPacks: account?.innovationPacks ?? [],
    innovationHubs: account?.innovationHubs ?? [],
  };

  const privileges = account?.authorization?.myPrivileges ?? [];

  const canCreateWingbackAccount = privileges.includes(AuthorizationPrivilege.AccountLicenseManage);
  const canCreateSpace = privileges.includes(AuthorizationPrivilege.CreateSpace);
  const canCreateInnovationPack = privileges.includes(AuthorizationPrivilege.CreateInnovationPack);
  const canCreateInnovationHub = privileges.includes(AuthorizationPrivilege.CreateInnovationHub);
  const canCreateVirtualContributor = privileges.includes(AuthorizationPrivilege.CreateVirtual);

  const canDeleteEntities = privileges.includes(AuthorizationPrivilege.Delete);

  const enableWingbackAccountCreation = !loading && !externalSubscriptionID;

  const { limit: spaceFreeLimit = 0, usage: spaceFreeUsage = 0 } =
    myAccountEntitlementDetails.find(entitlement => entitlement.type === LicenseEntitlementType.AccountSpaceFree) ?? {};
  const { limit: spacePlusLimit = 0, usage: spacePlusUsage = 0 } =
    myAccountEntitlementDetails.find(entitlement => entitlement.type === LicenseEntitlementType.AccountSpacePlus) ?? {};
  const { limit: spacePremiumLimit = 0, usage: spacePremiumUsage = 0 } =
    myAccountEntitlementDetails.find(entitlement => entitlement.type === LicenseEntitlementType.AccountSpacePremium) ??
    {};
  const hostedSpaceLimit = spaceFreeLimit + spacePlusLimit + spacePremiumLimit;
  const hostedSpaceUsage = spaceFreeUsage + spacePlusUsage + spacePremiumUsage;

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

  const getSpaceActions = (id: string) =>
    canDeleteEntities && (
      <MenuItemWithIcon
        key="delete"
        disabled={deleteSpaceLoading}
        iconComponent={DeleteOutline}
        onClick={() => openDeleteDialog(AccountEntityType.Space, id)}
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
        onClick={() => openDeleteDialog(AccountEntityType.VirtualContributor, id)}
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
        onClick={() => openDeleteDialog(AccountEntityType.InnovationPack, id)}
      >
        {t('buttons.delete')}
      </MenuItemWithIcon>
    );

  const getHubActions = (hub: Identifiable & { profile: { url: string } }) => (
    <>
      {canDeleteEntities && (
        <MenuItemWithIcon
          key="delete"
          disabled={deleteHubLoading}
          iconComponent={DeleteOutline}
          onClick={() => openDeleteDialog(AccountEntityType.InnovationHub, hub.id)}
        >
          {t('buttons.delete')}
        </MenuItemWithIcon>
      )}
      {hub.profile.url && (
        <MenuItemWithIcon
          key="settings"
          disabled={deleteHubLoading}
          iconComponent={SettingsOutlined}
          onClick={() => navigate(hub.profile.url)}
        >
          {t('common.settings')}
        </MenuItemWithIcon>
      )}
    </>
  );

  const limitNoticeTooltip = (
    <Trans
      i18nKey="pages.admin.generic.sections.account.limitNotice"
      components={{
        contact: <Link href={supportLink} target="_blank" sx={{ color: 'inherit' }} underline="always" />,
      }}
    />
  );

  return (
    <>
      <PageContentColumn columns={12} justifyContent="end">
        {canCreateWingbackAccount && (
          <CreationButton
            buttonComponent={
              <Button
                variant="contained"
                disabled={!enableWingbackAccountCreation}
                loading={isWingbackCreating}
                sx={{ textTransform: 'none', flexShrink: 1 }}
                onClick={onCreateWingbackAccount}
              >
                <Caption noWrap={true}>{t('pages.admin.generic.sections.account.addExternalSub')}</Caption>
              </Button>
            }
            disabled={!enableWingbackAccountCreation}
            disabledTooltip={t('pages.admin.generic.sections.account.externalSubExists')}
          />
        )}
      </PageContentColumn>
      <PageContentColumn columns={12}>
        <PageContentBlock halfWidth={true}>
          <BlockHeader
            title={t('pages.admin.generic.sections.account.hostedSpaces')}
            usage={hostedSpaceUsage}
            limit={hostedSpaceLimit}
            isAvailable={canCreateSpace}
            tooltip={t('pages.admin.generic.sections.account.spaceUsageNotice', {
              freeUsage: spaceFreeUsage,
              freeLimit: spaceFreeLimit,
              plusUsage: spacePlusUsage,
              plusLimit: spacePlusLimit,
              premiumUsage: spacePremiumUsage,
              premiumLimit: spacePremiumLimit,
            })}
          />
          <Gutters disablePadding={true} disableGap={true} justifyContent="space-between" fullHeight={true}>
            {loading && <SpaceCardHorizontalSkeleton />}
            <Gutters disablePadding={true}>
              {!loading &&
                account?.spaces.map(space => (
                  <SpaceCardHorizontal
                    key={space.id}
                    space={{ id: space.id, about: space.about, level: space.level, license: space.license }}
                    size="medium"
                    deepness={0}
                    seamless={true}
                    sx={{ display: 'inline-block', maxWidth: '100%', padding: 0 }}
                    actions={getSpaceActions(space.id)}
                    disableHoverState={true}
                  />
                ))}
            </Gutters>
          </Gutters>
          <Actions justifyContent="end">
            {account && canCreateSpace && (
              <>
                <CreationButton
                  buttonComponent={
                    <StyledCreationButton
                      disabled={!isEntitledToCreateSpace}
                      onClick={() => setCreateSpaceDialogOpen(true)}
                    />
                  }
                  disabled={!isEntitledToCreateSpace}
                  disabledTooltip={limitNoticeTooltip}
                />
                <CreateSpace
                  accountId={account.id}
                  open={createSpaceDialogOpen}
                  onClose={() => setCreateSpaceDialogOpen(false)}
                />
              </>
            )}
          </Actions>
        </PageContentBlock>
        <PageContentBlock halfWidth={true}>
          <BlockHeader
            title={t('pages.admin.generic.sections.account.virtualContributors')}
            usage={vcUsage}
            limit={vcLimit}
            isAvailable={canCreateVirtualContributor}
            tooltip={t('pages.admin.generic.sections.account.genericUsageNotice', {
              type: t('pages.admin.generic.sections.account.virtualContributors'),
              usage: vcUsage,
              limit: vcLimit,
            })}
          />
          <Gutters disablePadding={true} justifyContent="space-between" fullHeight={true}>
            {loading && <SpaceCardHorizontalSkeleton />}
            <Gutters disablePadding={true}>
              {!loading &&
                virtualContributors?.map(vc => (
                  <ContributorCardHorizontal
                    key={vc.id}
                    profile={vc.profile}
                    seamless={true}
                    withUnifiedTitle={true}
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
                  disabledTooltip={limitNoticeTooltip}
                />
              )}
            </Actions>
            <VirtualContributorWizard />
          </Gutters>
        </PageContentBlock>
        <PageContentBlock halfWidth={true}>
          <BlockHeader
            title={t('pages.admin.generic.sections.account.innovationPacks')}
            usage={innovationPackUsage}
            limit={innovationPackLimit}
            isAvailable={canCreateInnovationPack}
            tooltip={t('pages.admin.generic.sections.account.genericUsageNotice', {
              type: t('pages.admin.generic.sections.account.innovationPacks'),
              usage: innovationPackUsage,
              limit: innovationPackLimit,
            })}
          />
          <Gutters disablePadding={true} justifyContent="space-between" fullHeight={true}>
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
                    disabledTooltip={limitNoticeTooltip}
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
        <PageContentBlock halfWidth={true}>
          <BlockHeader
            title={t('pages.admin.generic.sections.account.customHomepages')}
            usage={innovationHubUsage}
            limit={innovationHubLimit}
            isAvailable={canCreateInnovationHub}
            tooltip={t('pages.admin.generic.sections.account.genericUsageNotice', {
              type: t('pages.admin.generic.sections.account.customHomepages'),
              usage: innovationHubUsage,
              limit: innovationHubLimit,
            })}
          />
          <Gutters disablePadding={true} justifyContent="space-between" fullHeight={true}>
            {loading && <InnovationHubCardHorizontalSkeleton />}
            {!loading &&
              innovationHubs?.map(hub => (
                <InnovationHubCardHorizontal key={hub.id} {...hub} actions={getHubActions(hub)} />
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
                    disabledTooltip={limitNoticeTooltip}
                  />
                  <CreateInnovationHubDialog
                    accountId={account.id}
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
              description={entity === AccountEntityType.Space ? undefined : SHORT_NON_SPACE_DESCRIPTION}
            />
          )}
        </PageContentBlock>
        {externalSubscriptionID && <Caption>Wingback id: {externalSubscriptionID}</Caption>}
      </PageContentColumn>
    </>
  );
};

export default ContributorAccountView;
