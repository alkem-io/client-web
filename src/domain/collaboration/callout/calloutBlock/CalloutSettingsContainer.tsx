import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DownloadForOfflineOutlinedIcon from '@mui/icons-material/DownloadForOfflineOutlined';
import { Box, Collapse, Menu } from '@mui/material';
import {
  AuthorizationPrivilege,
  CalloutGroupName,
  CalloutState,
  CalloutType,
  CalloutVisibility,
  ContributeTabPostFragment,
  MessageDetailsFragment,
  WhiteboardDetailsFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import { CalloutSummary } from '../CalloutSummary';
import CalloutVisibilityChangeDialog from '../edit/visibilityChangeDialog/CalloutVisibilityChangeDialog';
import CalloutEditDialog from '../edit/editDialog/CalloutEditDialog';
import { CalloutEditType } from '../edit/CalloutEditType';
import { CalloutLayoutEvents, CalloutSortProps } from '../CalloutViewTypes';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import MenuItemWithIcon from '../../../../core/ui/menu/MenuItemWithIcon';
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
import { Reference, Tagset } from '../../../common/profile/Profile';
import { JourneyTypeName } from '../../../journey/JourneyTypeName';
import { WhiteboardFragmentWithCallout } from '../useCallouts/useCallouts';
import CreateCalloutTemplateDialog from '../../../platform/admin/templates/CalloutTemplates/CreateCalloutTemplateDialog';
import { CalloutTemplateFormSubmittedValues } from '../../../platform/admin/templates/CalloutTemplates/CalloutTemplateForm';
import { useCreateCalloutTemplate } from '../../../platform/admin/templates/CalloutTemplates/useCreateCalloutTemplate';
import { LinkDetails } from '../links/LinkCollectionCallout';
import ConfirmationDialog from '../../../../core/ui/dialogs/ConfirmationDialog';
import useLoadingState from '../../../shared/utils/useLoadingState';
import { SimpleContainerProps } from '../../../../core/container/SimpleContainer';
import ExpandContentIcon from '../../../../core/ui/content/ExpandContent/ExpandContentIcon';
import { ShareDialog } from '../../../shared/components/ShareDialog/ShareDialog';

interface CalloutSettingsProvided {
  settingsOpen: boolean;
  onOpenSettings: (event: React.MouseEvent<HTMLElement>) => void;
  onCloseSettings: () => void;
  onOpenPosition: (event: React.MouseEvent<HTMLElement>) => void;
  onClosePosition: () => void;
}

export interface CalloutSettingsContainerProps
  extends CalloutLayoutEvents,
    Partial<CalloutSortProps>,
    SimpleContainerProps<CalloutSettingsProvided> {
  callout: {
    id: string;
    framing: {
      profile: {
        id: string;
        url: string;
        displayName: string;
        description?: string;
        references?: Reference[];
        tagset?: Tagset;
        storageBucket: {
          id: string;
        };
      };
      whiteboard?: WhiteboardFragmentWithCallout;
    };
    comments?: {
      messages: MessageDetailsFragment[] | undefined;
    };
    type: CalloutType;
    groupName: CalloutGroupName;
    contributionPolicy: {
      state: CalloutState;
    };
    contributionDefaults: {
      postDescription?: string;
      whiteboardContent?: string;
    };
    contributions?: {
      link?: LinkDetails;
      post?: ContributeTabPostFragment;
      whiteboard?: WhiteboardDetailsFragment;
    }[];
    draft: boolean;
    editable?: boolean;
    movable?: boolean;
    canSaveAsTemplate?: boolean;
    authorization?: {
      myPrivileges?: AuthorizationPrivilege[];
    };
    authorName?: string;
    authorAvatarUri?: string;
    publishedAt?: string;
  };
  calloutNames: string[];
  expanded?: boolean;
  onExpand?: () => void;
  journeyTypeName: JourneyTypeName;
}

const CalloutSettingsContainer = ({
  callout,
  onVisibilityChange,
  onCalloutEdit,
  onCalloutDelete,
  calloutNames,
  topCallout,
  bottomCallout,
  onMoveUp,
  onMoveDown,
  onMoveToTop,
  onMoveToBottom,
  expanded = false,
  onExpand,
  journeyTypeName,
  children,
}: CalloutSettingsContainerProps) => {
  const { t } = useTranslation();

  const { spaceNameId } = useUrlParams();

  if (!spaceNameId) {
    throw new Error('Must be within a Space');
  }

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
    await onVisibilityChange?.(callout.id, visibility, sendNotification);
    setVisibilityDialogOpen(false);
  };
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const handleDeleteDialogOpen = () => {
    setDeleteDialogOpen(true);
    setSettingsAnchorEl(null);
  };

  const handleSort = () => {
    // TODO: Implement sorting in #5405
  };

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
  const handleSaveAsTemplate = async (values: CalloutTemplateFormSubmittedValues) => {
    await handleCreateCalloutTemplate(values, callout, spaceNameId);
    setSaveAsTemplateDialogOpen(false);
  };
  const [editDialogOpened, setEditDialogOpened] = useState(false);
  const handleEditDialogOpen = () => {
    setSettingsAnchorEl(null);
    setEditDialogOpened(true);
  };
  const handleEditDialogClosed = () => setEditDialogOpened(false);
  const handleCalloutEdit = useCallback(
    async (newCallout: CalloutEditType) => {
      await onCalloutEdit?.(newCallout);
      setEditDialogOpened(false);
    },
    [onCalloutEdit, setEditDialogOpened]
  );
  const [positionAnchorEl, setPositionAnchorEl] = useState<null | HTMLElement>(null);
  const handlePositionOpened = (event: React.MouseEvent<HTMLElement>) => setPositionAnchorEl(event.currentTarget);
  const handlePositionClose = () => {
    setPositionDialogOpen(false);
    setPositionAnchorEl(null);
  };
  const [positionDialogOpen, setPositionDialogOpen] = useState(false);
  const handlePositionDialogOpen = () => {
    setPositionDialogOpen(true);
    setPositionAnchorEl(null);
  };
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const dontShow = callout.draft && !callout?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update);

  const handleMove = (callback?: (id: string) => void) => () => {
    handleSettingsClose();
    handlePositionClose();
    callback?.(callout.id);
  };

  if (dontShow) {
    return null;
  }

  return (
    <>
      {children({
        settingsOpen: settingsOpened,
        onOpenSettings: handleSettingsOpened,
        onCloseSettings: handleSettingsClose,
        onOpenPosition: handlePositionOpened,
        onClosePosition: handlePositionClose,
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
        {callout.editable && (
          <MenuItemWithIcon key="sort" iconComponent={SwapVerticalCircleOutlined} onClick={handleSort}>
            {t('callout.sortContributions')}
          </MenuItemWithIcon>
        )}
        {callout.canSaveAsTemplate && (
          <MenuItemWithIcon
            key="saveAsTemplate"
            iconComponent={DownloadForOfflineOutlinedIcon}
            onClick={handleSaveAsTemplateDialogOpen}
          >
            {t('callout.saveAsCallout')}
          </MenuItemWithIcon>
        )}
        {callout.movable && (
          <MenuItemWithIcon key="toolPosition" iconComponent={SwapVertOutlined} onClick={handlePositionDialogOpen}>
            <Box display="flex" alignItems="center">
              {t('buttons.toolPosition')}
              {positionDialogOpen && <KeyboardArrowRightOutlined fontSize="small" />}
            </Box>
          </MenuItemWithIcon>
        )}
        {!expanded && (
          <MenuItemWithIcon key="expand" iconComponent={ExpandContentIcon} onClick={onExpand}>
            {t('common.fullScreen')}
          </MenuItemWithIcon>
        )}
        <MenuItemWithIcon key="share" iconComponent={ShareOutlined} onClick={() => setShareDialogOpen(true)}>
          {t('buttons.share')}
        </MenuItemWithIcon>
      </Menu>
      <CalloutVisibilityChangeDialog
        open={visibilityDialogOpen}
        onClose={() => setVisibilityDialogOpen(false)}
        title={visDialogTitle}
        callout={callout}
        onVisibilityChanged={handleVisibilityChange}
      >
        <CalloutSummary callout={callout} />
      </CalloutVisibilityChangeDialog>
      <CreateCalloutTemplateDialog
        callout={callout}
        open={saveAsTemplateDialogOpen}
        onClose={() => setSaveAsTemplateDialogOpen(false)}
        onSubmit={handleSaveAsTemplate}
      />
      <Collapse in={positionDialogOpen} timeout="auto" unmountOnExit>
        <Menu
          id="callout-position-menu"
          aria-labelledby="callout-position-button"
          anchorEl={positionAnchorEl}
          open={positionDialogOpen}
          onClose={handlePositionClose}
          anchorOrigin={{
            vertical: 'bottom',
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
      {!!onCalloutDelete && (
        <CalloutEditDialog
          open={editDialogOpened}
          onClose={handleEditDialogClosed}
          calloutType={callout.type}
          callout={callout}
          onCalloutEdit={handleCalloutEdit}
          onDelete={() => setDeleteDialogOpen(true)}
          canChangeCalloutLocation
          calloutNames={calloutNames}
          journeyTypeName={journeyTypeName}
        />
      )}
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
