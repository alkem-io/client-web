import { useCalloutContentLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  CalloutContributionType,
  CalloutVisibility,
  TemplateType,
} from '@/core/apollo/generated/graphql-schema';
import { SimpleContainerProps } from '@/core/container/SimpleContainer';
import ExpandContentIcon from '@/core/ui/content/ExpandContent/ExpandContentIcon';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import { gutters } from '@/core/ui/grid/utils';
import MenuItemWithIcon from '@/core/ui/menu/MenuItemWithIcon';
import useEnsurePresence from '@/core/utils/ensurePresence';
import { ShareDialog } from '@/domain/shared/components/ShareDialog/ShareDialog';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import CreateTemplateDialog from '@/domain/templates/components/Dialogs/CreateEditTemplateDialog/CreateTemplateDialog';
import { TemplateCalloutFormSubmittedValues } from '@/domain/templates/components/Forms/TemplateCalloutForm';
import { useCreateCalloutTemplate } from '@/domain/templates/hooks/useCreateCalloutTemplate';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import {
  ArrowDownwardOutlined,
  ArrowUpwardOutlined,
  CheckCircleOutlined,
  DeleteOutline,
  EditOutlined,
  KeyboardArrowRightOutlined,
  ShareOutlined,
  SwapVerticalCircleOutlined,
  SwapVertOutlined,
  UnpublishedOutlined,
  VerticalAlignBottomOutlined,
  VerticalAlignTopOutlined,
} from '@mui/icons-material';
import DownloadForOfflineOutlinedIcon from '@mui/icons-material/DownloadForOfflineOutlined';
import { Box, Collapse, Menu } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalloutSortProps } from '../../calloutsSet/CalloutsView/CalloutSortModels';
import EditCalloutDialog from '../CalloutDialogs/EditCalloutDialog';
import { CalloutDetailsModelExtended } from '../models/CalloutDetailsModel';
import { LinkContribution } from '../../calloutContributions/link/models/LinkContribution';
import { PostContribution } from '../../calloutContributions/post/PostCard';
import { WhiteboardContribution } from '../../calloutContributions/whiteboard/WhiteboardCard';
import { CalloutSummary } from '../CalloutSummary';
import { CalloutLayoutEvents } from '../CalloutViewTypes';
import CalloutVisibilityChangeDialog from '../visibilityChangeDialog/CalloutVisibilityChangeDialog';
import CalloutContributionsSortDialog from '../../calloutContributions/calloutsContributionsSortDialog/CalloutContributionsSortDialog';
import { CalloutRestrictions } from '@/domain/collaboration/callout/CalloutRestrictionsTypes';

interface CalloutSettingsProvided {
  settingsOpen: boolean;
  onOpenSettings: (event: React.MouseEvent<HTMLElement>) => void;
  onCloseSettings: () => void;
}

export interface CalloutSettingsContainerProps
  extends CalloutLayoutEvents,
    Partial<CalloutSortProps>,
    SimpleContainerProps<CalloutSettingsProvided> {
  callout: CalloutDetailsModelExtended;
  items?: {
    posts?: PostContribution[];
    whiteboards?: WhiteboardContribution[];
    links?: LinkContribution[];
  };
  expanded?: boolean;
  onExpand?: (callout: CalloutDetailsModelExtended) => void;
  disableRichMedia?: boolean;
  calloutRestrictions?: CalloutRestrictions;
}

const CalloutSettingsContainer = ({
  callout,
  onVisibilityChange,
  onCalloutDelete,
  topCallout,
  bottomCallout,
  onMoveUp,
  onMoveDown,
  onMoveToTop,
  onMoveToBottom,
  expanded = false,
  onExpand,
  children,
  calloutRestrictions,
}: CalloutSettingsContainerProps) => {
  const { t } = useTranslation();
  const ensurePresence = useEnsurePresence();

  // levelZeroSpaceId is needed to save callout as template in this space
  const { levelZeroSpaceId } = useUrlResolver();

  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);
  const settingsOpened = Boolean(settingsAnchorEl);
  const handleSettingsOpened = (event: React.MouseEvent<HTMLElement>) => setSettingsAnchorEl(event.currentTarget);
  const handleSettingsClose = () => setSettingsAnchorEl(null);

  const [visibilityDialogOpen, setVisibilityDialogOpen] = useState(false);
  const handleVisibilityDialogOpen = () => {
    setVisibilityDialogOpen(true);
    setSettingsAnchorEl(null);
  };
  const visDialogTitle = useMemo(
    () => `${t(`buttons.${callout.draft ? '' : 'un'}publish` as const)} ${t('common.callout')}`,
    [callout.draft, t]
  );
  const handleVisibilityChange = async (visibility: CalloutVisibility, sendNotification: boolean) => {
    await onVisibilityChange?.(callout, visibility, sendNotification);
    setVisibilityDialogOpen(false);
  };
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const handleDeleteDialogOpen = () => {
    setDeleteDialogOpen(true);
    setSettingsAnchorEl(null);
  };

  const [sortDialogOpen, setSortDialogOpen] = useState(false);
  const handleSortDialogOpen = () => {
    setSortDialogOpen(true);
    setSettingsAnchorEl(null);
  };
  const handleSortDialogClose = () => setSortDialogOpen(false);

  const [handleDelete, loadingDelete] = useLoadingState(async () => {
    await onCalloutDelete?.(callout);
    setDeleteDialogOpen(false);
  });

  const [saveAsTemplateDialogOpen, setSaveAsTemplateDialogOpen] = useState(false);
  const handleSaveAsTemplateDialogOpen = () => {
    setSaveAsTemplateDialogOpen(true);
    setSettingsAnchorEl(null);
  };

  const { handleCreateCalloutTemplate } = useCreateCalloutTemplate();
  const handleSaveAsTemplate = async (values: TemplateCalloutFormSubmittedValues) => {
    const requiredSpaceId = ensurePresence(levelZeroSpaceId);

    await handleCreateCalloutTemplate(values, requiredSpaceId);
    setSaveAsTemplateDialogOpen(false);
  };
  const [editDialogOpened, setEditDialogOpened] = useState(false);
  const handleEditDialogOpen = () => {
    setSettingsAnchorEl(null);
    setEditDialogOpened(true);
  };

  const [positionAnchorEl, setPositionAnchorEl] = useState<null | HTMLElement>(null);
  const handlePositionClose = () => {
    setPositionDialogOpen(false);
    setPositionAnchorEl(null);
  };
  const [positionDialogOpen, setPositionDialogOpen] = useState(false);
  const handlePositionDialogOpen = (event: React.MouseEvent<HTMLElement>) => {
    setPositionDialogOpen(true);
    setPositionAnchorEl(event.target as HTMLElement);
  };
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const dontShow = callout.draft && !callout?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update);

  const handleMove = (callback?: (id: string) => void) => () => {
    handleSettingsClose();
    handlePositionClose();
    callback?.(callout.id);
  };

  const isCollection = (callout: { settings: { contribution: { allowedTypes: CalloutContributionType[] } } }) =>
    callout.settings.contribution.allowedTypes.length > 0;

  const [fetchCalloutContent] = useCalloutContentLazyQuery();

  if (dontShow) {
    return null;
  }

  const canBeSavedAsTemplate = callout.canBeSavedAsTemplate;

  return (
    <>
      {children({
        settingsOpen: settingsOpened,
        onOpenSettings: handleSettingsOpened,
        onCloseSettings: handleSettingsClose,
      })}
      <Menu
        id="callout-settings-menu"
        aria-labelledby="callout-settings-button"
        anchorEl={settingsAnchorEl}
        open={settingsOpened}
        onClose={handleSettingsClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        {callout.editable && (
          <MenuItemWithIcon key="edit" iconComponent={EditOutlined} onClick={handleEditDialogOpen}>
            {t('buttons.edit')}
          </MenuItemWithIcon>
        )}
        {callout.editable && (
          <MenuItemWithIcon
            key="publish"
            iconComponent={callout.draft ? CheckCircleOutlined : UnpublishedOutlined}
            onClick={handleVisibilityDialogOpen}
          >
            {t(`buttons.${callout.draft ? '' : 'un'}publish` as const)}
          </MenuItemWithIcon>
        )}
        {callout.editable && (
          <MenuItemWithIcon key="delete" iconComponent={DeleteOutline} onClick={handleDeleteDialogOpen}>
            {t('buttons.delete')}
          </MenuItemWithIcon>
        )}
        {callout.editable && isCollection(callout) && (
          <MenuItemWithIcon key="sort" iconComponent={SwapVerticalCircleOutlined} onClick={handleSortDialogOpen}>
            {t('callout.sortContributions')}
          </MenuItemWithIcon>
        )}
        {canBeSavedAsTemplate && (
          <MenuItemWithIcon
            key="saveAsTemplate"
            iconComponent={DownloadForOfflineOutlinedIcon}
            onClick={handleSaveAsTemplateDialogOpen}
          >
            {t('callout.saveAsTemplate')}
          </MenuItemWithIcon>
        )}
        {callout.movable && (
          <MenuItemWithIcon key="toolPosition" iconComponent={SwapVertOutlined} onClick={handlePositionDialogOpen}>
            <Box display="flex" alignItems="center">
              {t('buttons.toolPosition')}
              {positionDialogOpen ? <KeyboardArrowRightOutlined fontSize="small" /> : <Box marginLeft={gutters()} />}
            </Box>
          </MenuItemWithIcon>
        )}
        {!expanded && (
          <MenuItemWithIcon
            key="expand"
            iconComponent={ExpandContentIcon}
            onClick={() => {
              onExpand?.(callout);
              setSettingsAnchorEl(null);
            }}
          >
            {t('common.fullScreen')}
          </MenuItemWithIcon>
        )}
        <MenuItemWithIcon key="share" iconComponent={ShareOutlined} onClick={() => setShareDialogOpen(true)}>
          {t('buttons.share')}
        </MenuItemWithIcon>
      </Menu>
      <CalloutContributionsSortDialog open={sortDialogOpen} onClose={handleSortDialogClose} callout={callout} />
      <CalloutVisibilityChangeDialog
        open={visibilityDialogOpen}
        onClose={() => setVisibilityDialogOpen(false)}
        title={visDialogTitle}
        callout={callout}
        onVisibilityChanged={handleVisibilityChange}
      >
        <CalloutSummary callout={callout} />
      </CalloutVisibilityChangeDialog>
      <CreateTemplateDialog
        open={saveAsTemplateDialogOpen}
        onClose={() => setSaveAsTemplateDialogOpen(false)}
        templateType={TemplateType.Callout}
        onSubmit={handleSaveAsTemplate}
        getDefaultValues={async () => {
          const { data } = await fetchCalloutContent({
            variables: {
              calloutId: callout.id,
            },
          });
          return {
            type: TemplateType.Callout,
            callout: data?.lookup.callout,
          };
        }}
      />
      <Collapse in={positionDialogOpen} timeout="auto" unmountOnExit>
        <Menu
          anchorEl={positionAnchorEl}
          open={positionDialogOpen}
          onClose={handlePositionClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItemWithIcon
            key="moveUp"
            iconComponent={ArrowUpwardOutlined}
            onClick={handleMove(onMoveUp)}
            disabled={topCallout}
          >
            {t('buttons.moveUp')}
          </MenuItemWithIcon>
          <MenuItemWithIcon
            key="moveDown"
            iconComponent={ArrowDownwardOutlined}
            onClick={handleMove(onMoveDown)}
            disabled={bottomCallout}
          >
            {t('buttons.moveDown')}
          </MenuItemWithIcon>
          <MenuItemWithIcon
            key="moveToTop"
            iconComponent={VerticalAlignTopOutlined}
            onClick={handleMove(onMoveToTop)}
            disabled={topCallout}
          >
            {t('buttons.moveToTop')}
          </MenuItemWithIcon>
          <MenuItemWithIcon
            key="moveToBottom"
            iconComponent={VerticalAlignBottomOutlined}
            onClick={handleMove(onMoveToBottom)}
            disabled={bottomCallout}
          >
            {t('buttons.moveToBottom')}
          </MenuItemWithIcon>
        </Menu>
      </Collapse>
      <ShareDialog
        open={shareDialogOpen}
        entityTypeName="callout"
        url={callout.framing.profile.url}
        onClose={() => setShareDialogOpen(false)}
      />
      <EditCalloutDialog
        open={editDialogOpened}
        calloutRestrictions={calloutRestrictions}
        onClose={() => setEditDialogOpened(false)}
        calloutId={callout.id}
      />
      <ConfirmationDialog
        entities={{
          titleId: 'callout.delete-confirm-title',
          contentId: 'callout.delete-confirm-text',
          confirmButtonTextId: 'buttons.delete',
        }}
        options={{
          show: deleteDialogOpen,
        }}
        actions={{
          onConfirm: handleDelete,
          onCancel: () => setDeleteDialogOpen(false),
        }}
        state={{
          isLoading: loadingDelete,
        }}
      />
    </>
  );
};

export default CalloutSettingsContainer;
