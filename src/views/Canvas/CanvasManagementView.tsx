import { ApolloError } from '@apollo/client';
import React, { FC, useCallback, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import CanvasCreateDialog from '../../components/composite/dialogs/CanvasDialog/CanvasCreateDialog';
import CanvasDialog from '../../components/composite/dialogs/CanvasDialog/CanvasDialog';
import ConfirmationDialog from '../../components/composite/dialogs/ConfirmationDialog';
import { ICanvasActions } from '../../containers/canvas/CanvasActionsContainer';
import CanvasValueContainer from '../../containers/canvas/CanvasValueContainer';
import { useUserContext } from '../../hooks';
import {
  Canvas,
  CanvasCheckoutStateEnum,
  CanvasDetailsFragment,
  CreateCanvasCanvasTemplateFragment,
} from '../../models/graphql-schema';
import { ViewProps } from '../../models/view';
import { CanvasListView } from './CanvasListView';
import { CanvasListItemCanvas } from '../../components/composite/lists/Canvas/CanvasListItem';

export interface CanvasManagementViewEntities {
  contextID: string;
  contextSource: 'hub' | 'challenge' | 'opportunity';
  canvases: CanvasDetailsFragment[];
  templates: CreateCanvasCanvasTemplateFragment[];
  templateListHeader?: string;
  templateListSubheader?: string;
}

export interface CanvasManagementViewActions extends ICanvasActions {}

export interface ContextViewState {
  loadingCanvases?: boolean;
  creatingCanvas?: boolean;
  deletingCanvas?: boolean;
  changingCanvasLockState?: boolean;
  updatingCanvas?: boolean;
  loadingCanvasValue?: boolean;
  error?: ApolloError;
}

export interface CanvasManagementViewOptions {
  canUpdate?: boolean;
  canCreate?: boolean;
  canDelete?: boolean;
}

export interface CanvasManagementViewProps
  extends ViewProps<
    CanvasManagementViewEntities,
    CanvasManagementViewActions,
    ContextViewState,
    CanvasManagementViewOptions
  > {}

const CanvasManagementView: FC<CanvasManagementViewProps> = ({ entities, actions, state, options }) => {
  const [activeCanvasId, setActiveCanvasId] = useState<string | undefined>(undefined);
  const [canvasBeingDeleted, setCanvasBeingDeleted] = useState<CanvasListItemCanvas | undefined>(undefined);

  const [showCreateCanvasDialog, setShowCreateCanvasDialog] = useState<boolean>(false);
  const { user } = useUserContext();
  const { t } = useTranslation();

  const loadCanvas = useCallback(
    (canvas: Pick<Canvas, 'id'>) => {
      setActiveCanvasId(canvas.id);
    },
    [setActiveCanvasId]
  );

  const actualActiveCanvas = useMemo(
    () => (activeCanvasId ? entities.canvases.find(c => c.id === activeCanvasId) : undefined),
    [activeCanvasId, entities.canvases]
  );

  const isCanvasCheckedoutByMe =
    actualActiveCanvas?.checkout?.status === CanvasCheckoutStateEnum.CheckedOut &&
    actualActiveCanvas.checkout.lockedBy === user?.user.id;
  const isCanvasAvailable = actualActiveCanvas?.checkout?.status === CanvasCheckoutStateEnum.Available;

  return (
    <>
      <CanvasListView
        entities={{
          canvases: entities.canvases,
          header: t('pages.canvas.header', { blockName: entities.contextSource }),
          subheader: t('pages.canvas.subheader'),
          noItemsMessage: t('pages.canvas.no-canvases'),
        }}
        state={{
          loading: Boolean(state.loadingCanvases),
        }}
        actions={{
          onSelect: loadCanvas,
          onCreate: () => setShowCreateCanvasDialog(true),
          onDelete: canvas => setCanvasBeingDeleted(canvas), //actions.onDelete({ canvasID: canvas.id, contextID: entities.contextID }),
        }}
        options={{
          canDelete: options.canDelete,
          canCreate: options.canCreate,
        }}
      />
      <CanvasValueContainer canvasId={activeCanvasId}>
        {entities => (
          <CanvasDialog
            entities={{ canvas: entities.canvas }}
            actions={{
              onCancel: () => setActiveCanvasId(undefined),
              onCheckin: actions.onCheckin,
              onCheckout: actions.onCheckout,
              onUpdate: actions.onUpdate,
            }}
            options={{
              show: Boolean(activeCanvasId),
              canCheckout: isCanvasAvailable && options.canUpdate,
              canEdit: isCanvasCheckedoutByMe && options.canUpdate,
            }}
            state={state}
          />
        )}
      </CanvasValueContainer>
      <CanvasCreateDialog
        entities={{
          contextID: entities.contextID,
          templates: entities.templates,
        }}
        actions={{
          onCancel: () => setShowCreateCanvasDialog(false),
          onConfirm: input => {
            actions.onCreate(input);
            setShowCreateCanvasDialog(false);
          },
        }}
        options={{
          show: showCreateCanvasDialog,
        }}
        state={{
          canvasLoading: state.loadingCanvasValue,
          templatesLoading: state.loadingCanvases,
        }}
      />
      <ConfirmationDialog
        actions={{
          onCancel: () => setCanvasBeingDeleted(undefined),
          onConfirm: async () => {
            if (canvasBeingDeleted) {
              await actions.onDelete({ canvasID: canvasBeingDeleted.id, contextID: entities.contextID });
              setCanvasBeingDeleted(undefined);
            }
          },
        }}
        entities={{
          confirmButtonTextId: 'buttons.delete',
          contentId: 'pages.canvas.delete.confirmation-text',
          title: (
            <Trans
              i18nKey="pages.canvas.delete.confirmation-title"
              values={{ blockName: canvasBeingDeleted?.displayName }}
              components={{ b: <strong /> }}
            />
          ),
        }}
        options={{
          show: Boolean(canvasBeingDeleted),
        }}
        state={{
          isLoading: Boolean(state.deletingCanvas),
        }}
      />
    </>
  );
};

export default CanvasManagementView;
