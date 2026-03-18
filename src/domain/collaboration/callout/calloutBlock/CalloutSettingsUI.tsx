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
import { useTranslation } from 'react-i18next';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import ExpandContentIcon from '@/core/ui/content/ExpandContent/ExpandContentIcon';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import { gutters } from '@/core/ui/grid/utils';
import MenuItemWithIcon from '@/core/ui/menu/MenuItemWithIcon';
import { ShareDialog } from '@/domain/shared/components/ShareDialog/ShareDialog';
import CreateTemplateDialog from '@/domain/templates/components/Dialogs/CreateEditTemplateDialog/CreateTemplateDialog';
import CalloutContributionsSortDialog from '../../calloutContributions/calloutsContributionsSortDialog/CalloutContributionsSortDialog';
import EditCalloutDialog from '../CalloutDialogs/EditCalloutDialog';
import { CalloutSummary } from '../CalloutSummary';
import CalloutVisibilityChangeDialog from '../visibilityChangeDialog/CalloutVisibilityChangeDialog';
import type { UseCalloutSettingsResult } from './useCalloutSettings';

interface CalloutSettingsUIProps {
  settings: UseCalloutSettingsResult;
}

const CalloutSettingsUI = ({ settings }: CalloutSettingsUIProps) => {
  const { t } = useTranslation();

  const {
    callout,
    settingsAnchorEl,
    settingsOpened,
    handleSettingsClose,
    visibilityDialogOpen,
    setVisibilityDialogOpen,
    visDialogTitle,
    handleVisibilityDialogOpen,
    handleVisibilityChange,
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleDeleteDialogOpen,
    handleDelete,
    loadingDelete,
    sortDialogOpen,
    handleSortDialogOpen,
    handleSortDialogClose,
    saveAsTemplateDialogOpen,
    setSaveAsTemplateDialogOpen,
    handleSaveAsTemplateDialogOpen,
    handleSaveAsTemplate,
    fetchCalloutContent,
    editDialogOpened,
    setEditDialogOpened,
    handleEditDialogOpen,
    positionAnchorEl,
    positionDialogOpen,
    handlePositionClose,
    handlePositionDialogOpen,
    shareDialogOpen,
    setShareDialogOpen,
    canBeSavedAsTemplate,
    isCollection,
    handleMove,
    topCallout,
    bottomCallout,
    onMoveUp,
    onMoveDown,
    onMoveToTop,
    onMoveToBottom,
    expanded,
    onExpand,
    calloutRestrictions,
  } = settings;

  return (
    <>
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
        {callout.editable && isCollection && (
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
              handleSettingsClose();
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
      <Collapse in={positionDialogOpen} timeout="auto" unmountOnExit={true}>
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

export default CalloutSettingsUI;
