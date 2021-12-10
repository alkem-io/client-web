import { ApolloError } from '@apollo/client';
import { Grid } from '@mui/material';
import React, { FC, useCallback, useMemo, useState } from 'react';
import CanvasCreateDialog from '../../components/composite/dialogs/CanvasDialog/CanvasCreateDialog';
import CanvasDialog from '../../components/composite/dialogs/CanvasDialog/CanvasDialog';
import { ICanvasActions } from '../../containers/canvas/CanvasActionsContainer';
import { useUserContext } from '../../hooks';
import { CanvasWithoutValue } from '../../models/entities/canvas';
import { AuthorizationPrivilege, Canvas, CanvasCheckoutStateEnum } from '../../models/graphql-schema';
import { ViewProps } from '../../models/view';
import { CanvasListView } from './CanvasListView';

export interface CanvasManagementViewEntities {
  // opportunity: OpportunityPageFragment;
  contextID: string;
  canvases: CanvasWithoutValue[];
}

export interface CanvasManagementViewActions extends ICanvasActions {}

export interface ContextViewState {
  loadingCanvases?: boolean;
  creatingCanvas?: boolean;
  deletingCanvas?: boolean;
  changingCanvasLockState?: boolean;
  updatingCanvas?: boolean;
  error?: ApolloError;
}

export interface CanvasManagementViewOptions {
  isEditable?: boolean;
}

export interface CanvasManagementViewProps
  extends ViewProps<
    CanvasManagementViewEntities,
    CanvasManagementViewActions,
    ContextViewState,
    CanvasManagementViewOptions
  > {}

const CanvasManagementView: FC<CanvasManagementViewProps> = ({ entities, actions, state }) => {
  const [activeCanvasId, setActiveCanvasId] = useState<string | undefined>(undefined);
  const [showCreateCanvasDialog, setShowCreateCanvasDialog] = useState<boolean>(false);
  const { user } = useUserContext();

  const loadCanvas = useCallback<typeof actions['onLoad']>(
    async canvas => {
      if (canvas && actions.onLoad) {
        await actions.onLoad(canvas);
        setActiveCanvasId(canvas?.id);
      }
    },
    [actions.onLoad, setActiveCanvasId]
  );

  const activeCanvas = useMemo(
    () => entities.canvases.find(c => c.id === activeCanvasId) as Canvas,
    [entities.canvases, activeCanvasId]
  );

  const isCanvasCheckedoutByMe =
    activeCanvas?.checkout?.status === CanvasCheckoutStateEnum.CheckedOut &&
    activeCanvas.checkout.lockedBy === user?.user.id;
  const isCanvasAvailable = activeCanvas?.checkout?.status === CanvasCheckoutStateEnum.Available;
  const doIHavePermissionsToEdit = activeCanvas?.authorization?.myPrivileges?.some(
    x => x === AuthorizationPrivilege.Update
  );

  const nonTemplateCanvases = useMemo(() => entities.canvases.filter(c => c.isTemplate === false), [entities.canvases]);
  const templateCanvases = useMemo(() => entities.canvases.filter(c => c.isTemplate === true), [entities.canvases]);

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <CanvasListView
            entities={{ canvases: nonTemplateCanvases, headerTemplate: 'pages.canvas.header' }}
            state={{
              loading: Boolean(state.loadingCanvases),
            }}
            actions={{
              onSelect: loadCanvas,
              onCreate: () => setShowCreateCanvasDialog(true),
              onDelete: canvas => actions.onDelete({ canvasID: canvas.id, contextID: entities.contextID }),
            }}
            options={{
              canDelete: true,
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CanvasListView
            entities={{ canvases: templateCanvases, headerTemplate: 'pages.canvas.template.header' }}
            state={{
              loading: Boolean(state.loadingCanvases),
            }}
            actions={{
              onSelect: loadCanvas,
              onDelete: canvas => actions.onDelete({ canvasID: canvas.id, contextID: entities.contextID }),
            }}
            options={{
              canDelete: true,
            }}
          />
        </Grid>
      </Grid>
      <CanvasDialog
        entities={{ canvas: activeCanvas }}
        actions={{
          onCancel: () => setActiveCanvasId(undefined),
          onCheckin: actions.onCheckin,
          onCheckout: actions.onCheckout,
          onMarkAsTemplate: canvas => {
            actions.onPromoteToTemplate(canvas);
            setActiveCanvasId(undefined);
          },
          onUpdate: actions.onUpdate,
        }}
        options={{
          show: Boolean(activeCanvasId),
          canCheckout: isCanvasAvailable && doIHavePermissionsToEdit,
          canEdit: isCanvasCheckedoutByMe && doIHavePermissionsToEdit,
        }}
        state={{
          loading:
            state.creatingCanvas || state.deletingCanvas || state.updatingCanvas || state.changingCanvasLockState,
        }}
      />
      <CanvasCreateDialog
        entities={{
          contextID: entities.contextID,
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
      />
    </>
  );
};

export default CanvasManagementView;
