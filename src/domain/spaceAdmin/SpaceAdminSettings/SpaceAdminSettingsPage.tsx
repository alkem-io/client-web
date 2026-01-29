import {
  useDeleteSpaceMutation,
  useSpacePrivilegesQuery,
  useSpaceSettingsQuery,
  useSpaceTemplatesManagerQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import ButtonWithTooltip from '@/core/ui/button/ButtonWithTooltip';
import PageContent from '@/core/ui/content/PageContent';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockCollapsible from '@/core/ui/content/PageContentBlockCollapsible';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { BlockTitle, Caption, Text } from '@/core/ui/typography';
import CommunityApplicationForm from '@/domain/community/community/CommunityApplicationForm/CommunityApplicationForm';
import { SettingsSection } from '@/domain/platformAdmin/layout/EntitySettingsLayout/SettingsSection';
import type { SettingsPageProps } from '@/domain/platformAdmin/layout/EntitySettingsLayout/types';
import { Box, Button, CircularProgress, useTheme } from '@mui/material';
import { noop } from 'lodash';
import { FC, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import EntityConfirmDeleteDialog from '../../shared/components/EntityConfirmDeleteDialog';
import LayoutSwitcher from '../layout/SpaceAdminLayoutSwitcher';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CreateSpaceTemplateDialog from '@/domain/templates/components/Dialogs/CreateEditTemplateDialog/CreateSpaceTemplateDialog';
import { useSpaceSettingsUpdate } from './useSpaceSettingsUpdate';
import { VisibilitySettings } from './components/VisibilitySettings';
import { MembershipSettings } from './components/MembershipSettings';
import { MemberActionsSettings } from './components/MemberActionsSettings';
import { isSubspace } from '@/domain/space/utils/spaceLevel';

export interface SpaceAdminSettingsPageProps extends SettingsPageProps {
  useL0Layout: boolean;
  level: SpaceLevel;
  spaceId: string;
  parentSpaceUrl: string;
  membershipsEnabled: boolean;
  subspacesEnabled: boolean;
  privateSettingsEnabled: boolean;
}

const SpaceAdminSettingsPage: FC<SpaceAdminSettingsPageProps> = ({
  useL0Layout,
  level,
  parentSpaceUrl,
  spaceId,
  membershipsEnabled,
  subspacesEnabled,
  privateSettingsEnabled,
  routePrefix = '../',
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const notify = useNotification();

  const [saveAsTemplateDialogOpen, setSaveAsTemplateDialogOpen] = useState<boolean>(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const openDialog = () => setOpenDeleteDialog(true);
  const closeDialog = () => setOpenDeleteDialog(false);

  const [deleteSpace] = useDeleteSpaceMutation({
    onCompleted: () => {
      notify(t('pages.admin.space.notifications.space-removed'), 'success');
      window.location.replace(parentSpaceUrl);
    },
  });

  const { data } = useSpacePrivilegesQuery({
    variables: {
      spaceId: spaceId,
    },
    skip: !spaceId,
  });

  const privileges = data?.lookup.space?.authorization?.myPrivileges ?? [];
  const canDelete = privileges?.includes(AuthorizationPrivilege.Delete);

  const handleDelete = (id: string) => {
    return deleteSpace({
      variables: {
        spaceId: id,
      },
    });
  };

  const { data: settingsData, loading } = useSpaceSettingsQuery({
    variables: {
      spaceId,
    },
    skip: !spaceId,
  });
  const roleSetId = settingsData?.lookup.space?.about.membership.roleSetID;
  const provider = settingsData?.lookup.space?.about.provider;
  const hostId = provider?.id;

  // check for TemplateCreation privileges
  const { data: templateData } = useSpaceTemplatesManagerQuery({
    variables: { spaceId },
    skip: !spaceId,
  });

  const templatesSet = templateData?.lookup.space?.templatesManager?.templatesSet;
  const templateSetPrivileges = templatesSet?.authorization?.myPrivileges ?? [];
  const canCreateTemplate = templateSetPrivileges?.includes(AuthorizationPrivilege.Create);

  const currentSettings = useMemo(() => {
    const settings = settingsData?.lookup.space?.settings;
    return {
      ...settings,
      hostOrganizationTrusted: (!!hostId && settings?.membership.trustedOrganizations.includes(hostId)) ?? false,
    };
  }, [settingsData, hostId]);

  const { optimisticSettings, updateSettings } = useSpaceSettingsUpdate({
    spaceId,
    currentSettings,
    hostId,
  });

  return (
    <LayoutSwitcher currentTab={SettingsSection.SpaceSettings} tabRoutePrefix={routePrefix} useL0Layout={useL0Layout}>
      <PageContent background="transparent">
        {!loading && (
          <>
            {privateSettingsEnabled && (
              <VisibilitySettings
                currentMode={currentSettings?.privacy?.mode}
                currentMembershipPolicy={currentSettings?.membership?.policy}
                level={level}
                onUpdate={privacyMode => updateSettings({ privacyMode })}
              />
            )}

            {membershipsEnabled && (
              <MembershipSettings
                currentPolicy={currentSettings?.membership?.policy}
                hostOrganizationTrusted={currentSettings.hostOrganizationTrusted}
                providerDisplayName={provider?.profile.displayName}
                level={level}
                onUpdate={updateSettings}
              />
            )}

            {membershipsEnabled && (
              <PageContentBlockCollapsible header={<BlockTitle>{t('community.application-form.title')}</BlockTitle>}>
                <Text marginBottom={gutters(2)}>
                  <Trans i18nKey="community.application-form.subtitle" components={{ b: <strong /> }} />
                </Text>
                <CommunityApplicationForm roleSetId={roleSetId!} />
              </PageContentBlockCollapsible>
            )}

            <MemberActionsSettings
              optimisticSettings={optimisticSettings}
              currentSettings={currentSettings}
              level={level}
              membershipsEnabled={membershipsEnabled}
              subspacesEnabled={subspacesEnabled}
              onUpdate={updateSettings}
            />
            {isSubspace(level) && (
              <PageContentBlock>
                <PageContentBlockHeader title={t('pages.admin.space.settings.copySpace.title')} />
                <Text>{t('pages.admin.space.settings.copySpace.description')}</Text>
                <Gutters disablePadding row>
                  {canCreateTemplate ? (
                    <Button variant="contained" onClick={() => setSaveAsTemplateDialogOpen(true)}>
                      {t('pages.admin.space.settings.copySpace.createTemplate')}
                    </Button>
                  ) : (
                    <ButtonWithTooltip
                      tooltip={t('pages.admin.space.settings.copySpace.createTemplateTooltip')}
                      tooltipPlacement="right"
                      variant="outlined"
                      onClick={noop}
                    >
                      {t('pages.admin.space.settings.copySpace.createTemplate')}
                    </ButtonWithTooltip>
                  )}
                  <Button variant="outlined" onClick={/* PENDING */ () => {}} disabled>
                    {t('pages.admin.space.settings.copySpace.duplicate')}
                  </Button>
                </Gutters>
                {saveAsTemplateDialogOpen && templatesSet && (
                  <CreateSpaceTemplateDialog
                    open
                    onClose={() => setSaveAsTemplateDialogOpen(false)}
                    spaceId={spaceId}
                    templatesSetId={templatesSet.id}
                  />
                )}
              </PageContentBlock>
            )}
            {isSubspace(level) && canDelete && (
              <PageContentBlock sx={{ borderColor: theme.palette.error.main }}>
                <PageContentBlockHeader
                  sx={{ color: theme.palette.error.main }}
                  title={t('components.deleteEntity.title')}
                />
                <Box display="flex" gap={1} alignItems="center" sx={{ cursor: 'pointer' }} onClick={openDialog}>
                  <DeleteOutlineIcon color="error" />
                  <Caption>{t('components.deleteEntity.description', { entity: t('common.subspace') })}</Caption>
                </Box>
              </PageContentBlock>
            )}
            {openDeleteDialog && (
              <EntityConfirmDeleteDialog
                entity={t('common.subspace')}
                open={openDeleteDialog}
                onClose={closeDialog}
                onDelete={() => handleDelete(spaceId)}
              />
            )}
          </>
        )}
        {loading && (
          <Box marginX="auto">
            <CircularProgress />
          </Box>
        )}
      </PageContent>
    </LayoutSwitcher>
  );
};

export default SpaceAdminSettingsPage;
