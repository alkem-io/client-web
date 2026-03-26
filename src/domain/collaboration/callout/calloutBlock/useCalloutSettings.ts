import type React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCalloutContentLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  type CalloutContributionType,
  type CalloutVisibility,
} from '@/core/apollo/generated/graphql-schema';
import useEnsurePresence from '@/core/utils/ensurePresence';
import type { CalloutRestrictions } from '@/domain/collaboration/callout/CalloutRestrictionsTypes';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import type { TemplateCalloutFormSubmittedValues } from '@/domain/templates/components/Forms/TemplateCalloutForm';
import { useCreateCalloutTemplate } from '@/domain/templates/hooks/useCreateCalloutTemplate';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import type { CalloutSortProps } from '../../calloutsSet/CalloutsView/CalloutSortModels';
import type { CalloutLayoutEvents } from '../CalloutViewTypes';
import type { CalloutDetailsModelExtended } from '../models/CalloutDetailsModel';

export interface UseCalloutSettingsParams extends CalloutLayoutEvents, Partial<CalloutSortProps> {
  callout: CalloutDetailsModelExtended;
  expanded?: boolean;
  onExpand?: (callout: CalloutDetailsModelExtended) => void;
  calloutRestrictions?: CalloutRestrictions;
}

export interface CalloutSettingsProvided {
  settingsOpen: boolean;
  onOpenSettings: (event: React.MouseEvent<HTMLElement>) => void;
  onCloseSettings: () => void;
}

const useCalloutSettings = ({
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
  calloutRestrictions,
}: UseCalloutSettingsParams) => {
  const { t } = useTranslation();
  const ensurePresence = useEnsurePresence();

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
  const visDialogTitle = `${t(`buttons.${callout.draft ? '' : 'un'}publish` as const)} ${t('common.callout')}`;
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

  const dontShow = Boolean(
    callout.draft && !callout?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update)
  );

  const handleMove = (callback?: (id: string) => void) => () => {
    handleSettingsClose();
    handlePositionClose();
    callback?.(callout.id);
  };

  const isCollection =
    (callout as { settings: { contribution: { allowedTypes: CalloutContributionType[] } } }).settings.contribution
      .allowedTypes.length > 0;

  const [fetchCalloutContent] = useCalloutContentLazyQuery();

  const canBeSavedAsTemplate = callout.canBeSavedAsTemplate;

  const provided: CalloutSettingsProvided = {
    settingsOpen: settingsOpened,
    onOpenSettings: handleSettingsOpened,
    onCloseSettings: handleSettingsClose,
  };

  return {
    provided,
    dontShow,
    // Menu
    settingsAnchorEl,
    settingsOpened,
    handleSettingsClose,
    // Visibility
    visibilityDialogOpen,
    setVisibilityDialogOpen,
    visDialogTitle,
    handleVisibilityDialogOpen,
    handleVisibilityChange,
    // Delete
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleDeleteDialogOpen,
    handleDelete,
    loadingDelete,
    // Sort
    sortDialogOpen,
    handleSortDialogOpen,
    handleSortDialogClose,
    // Save as template
    saveAsTemplateDialogOpen,
    setSaveAsTemplateDialogOpen,
    handleSaveAsTemplateDialogOpen,
    handleSaveAsTemplate,
    fetchCalloutContent,
    // Edit
    editDialogOpened,
    setEditDialogOpened,
    handleEditDialogOpen,
    // Position
    positionAnchorEl,
    positionDialogOpen,
    handlePositionClose,
    handlePositionDialogOpen,
    // Share
    shareDialogOpen,
    setShareDialogOpen,
    // Helpers
    canBeSavedAsTemplate,
    isCollection,
    handleMove,
    // Props pass-through for rendering
    callout,
    topCallout,
    bottomCallout,
    onMoveUp,
    onMoveDown,
    onMoveToTop,
    onMoveToBottom,
    expanded,
    onExpand,
    calloutRestrictions,
  };
};

export type UseCalloutSettingsResult = ReturnType<typeof useCalloutSettings>;

export default useCalloutSettings;
