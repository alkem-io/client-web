import { ApolloError } from '@apollo/client';
import { Grid } from '@mui/material';
import React, { FC, useCallback, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import CanvasCreateDialog from '../../components/composite/dialogs/CanvasDialog/CanvasCreateDialog';
import CanvasDialog from '../../components/composite/dialogs/CanvasDialog/CanvasDialog';
import ConfirmationDialog from '../../components/composite/dialogs/ConfirmationDialog';
import { ICanvasActions } from '../../containers/canvas/CanvasActionsContainer';
import { ITemplateQueryResult } from '../../containers/canvas/CanvasProvider';
import { useUserContext } from '../../hooks';
import { CanvasWithoutValue } from '../../models/entities/canvas';
import { AuthorizationPrivilege, Canvas, CanvasCheckoutStateEnum } from '../../models/graphql-schema';
import { ViewProps } from '../../models/view';
import { CanvasListView } from './CanvasListView';

export interface CanvasManagementViewEntities {
  // opportunity: OpportunityPageFragment;
  contextID: string;
  contextSource: 'hub' | 'challenge' | 'opportunity';
  canvases: CanvasWithoutValue[];
  templates: Record<string, ITemplateQueryResult>;
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
  const [activeCanvas, setActiveCanvas] = useState<Canvas | undefined>(undefined);
  const [deletableCanvas, setDeletableCanvas] = useState<CanvasWithoutValue | undefined>(undefined);

  const [showCreateCanvasDialog, setShowCreateCanvasDialog] = useState<boolean>(false);
  const { user } = useUserContext();
  const { t } = useTranslation();

  const loadCanvas = useCallback<typeof actions['onLoad']>(
    async canvas => {
      if (canvas && actions.onLoad) {
        const loadedCanvas = await actions.onLoad(canvas);
        setActiveCanvas(loadedCanvas);

        return loadedCanvas;
      }
    },
    [actions.onLoad, setActiveCanvas]
  );

  const actualActiveCanvas = useMemo(
    () =>
      activeCanvas
        ? {
            ...activeCanvas,
            ...entities.canvases.find(c => c.id === activeCanvas?.id),
          }
        : undefined,
    [activeCanvas, entities.canvases]
  );

  const isCanvasCheckedoutByMe =
    actualActiveCanvas?.checkout?.status === CanvasCheckoutStateEnum.CheckedOut &&
    actualActiveCanvas.checkout.lockedBy === user?.user.id;
  const isCanvasAvailable = actualActiveCanvas?.checkout?.status === CanvasCheckoutStateEnum.Available;
  const doIHavePermissionsToEdit = actualActiveCanvas?.authorization?.myPrivileges?.some(
    x => x === AuthorizationPrivilege.Update
  );

  const nonTemplateCanvases = useMemo(() => entities.canvases.filter(c => c.isTemplate === false), [entities.canvases]);
  const templateCanvases = useMemo(() => entities.canvases.filter(c => c.isTemplate === true), [entities.canvases]);

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <CanvasListView
            entities={{
              canvases: nonTemplateCanvases,
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
              onDelete: canvas => setDeletableCanvas(canvas), //actions.onDelete({ canvasID: canvas.id, contextID: entities.contextID }),
            }}
            options={{
              canDelete: true,
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CanvasListView
            entities={{
              canvases: templateCanvases,
              header: entities.templateListHeader || t('pages.canvas.template.header'),
              subheader: entities.templateListSubheader,
              noItemsMessage: t('pages.canvas.template.no-templates'),
              howToMessage: t('pages.canvas.template.how-to'),
            }}
            state={{
              loading: Boolean(state.loadingCanvases),
            }}
            actions={{
              onSelect: loadCanvas,
              onDelete: canvas => setDeletableCanvas(canvas), //canvas => actions.onDelete({ canvasID: canvas.id, contextID: entities.contextID }),
            }}
            options={{
              canDelete: true,
            }}
          />
        </Grid>
      </Grid>
      <CanvasDialog
        entities={{ canvas: actualActiveCanvas }}
        actions={{
          onCancel: () => setActiveCanvas(undefined),
          onCheckin: actions.onCheckin,
          onCheckout: actions.onCheckout,
          onMarkAsTemplate: canvas => {
            actions.onPromoteToTemplate(canvas);
            setActiveCanvas(undefined);
          },
          onUpdate: actions.onUpdate,
        }}
        options={{
          show: Boolean(activeCanvas),
          canCheckout: isCanvasAvailable && doIHavePermissionsToEdit,
          canEdit: isCanvasCheckedoutByMe && doIHavePermissionsToEdit,
        }}
        state={{
          loading:
            state.creatingCanvas ||
            state.deletingCanvas ||
            state.updatingCanvas ||
            state.changingCanvasLockState ||
            state.loadingCanvasValue,
        }}
      />
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
          onLoad: actions.onLoad,
        }}
        options={{
          show: showCreateCanvasDialog,
        }}
      />
      <ConfirmationDialog
        actions={{
          onCancel: () => setDeletableCanvas(undefined),
          onConfirm: async () => {
            if (deletableCanvas) {
              await actions.onDelete({ canvasID: deletableCanvas.id, contextID: entities.contextID });
              setDeletableCanvas(undefined);
            }
          },
        }}
        entities={{
          confirmButtonTextId: 'buttons.delete',
          contentId: 'pages.canvas.delete.confirmation-text',
          title: (
            <Trans
              i18nKey="pages.canvas.delete.confirmation-title"
              values={{ blockName: deletableCanvas?.name }}
              components={{ b: <strong /> }}
            />
          ),
        }}
        options={{
          show: Boolean(deletableCanvas),
        }}
        state={{
          isLoading: Boolean(state.deletingCanvas),
        }}
      />
    </>
  );
};

export default CanvasManagementView;
