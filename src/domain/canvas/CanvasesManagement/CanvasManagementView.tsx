import { ApolloError } from '@apollo/client';
import React, { FC, useCallback, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import CanvasCreateDialog from '../../../components/composite/dialogs/CanvasDialog/CanvasCreateDialog';
import CanvasDialog from '../../../components/composite/dialogs/CanvasDialog/CanvasDialog';
import ConfirmationDialog from '../../../components/composite/dialogs/ConfirmationDialog';
import { ICanvasActions } from '../../../containers/canvas/CanvasActionsContainer';
import CanvasValueContainer from '../../../containers/canvas/CanvasValueContainer';
import { useUserContext } from '../../../hooks';
import {
  CanvasCheckoutStateEnum,
  CanvasDetailsFragment,
  CreateCanvasCanvasTemplateFragment,
} from '../../../models/graphql-schema';
import { ViewProps } from '../../../models/view';
import { CanvasListItemCanvas } from '../../../components/composite/lists/Canvas/CanvasListItem';
import CanvasesDashboardSection from '../CanvasesDashboardSection/CanvasesDashboardSection';
import { LinkWithState } from '../../shared/types/LinkWithState';

export interface ActiveCanvasIdHolder {
  canvasId?: string;
}

export interface CanvasManagementViewEntities extends ActiveCanvasIdHolder {
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

export interface CanvasNavigationMethods {
  backToCanvases: () => void;
  buildLinkToCanvas: (url: string) => LinkWithState;
}

export interface CanvasManagementViewProps
  extends ViewProps<
      CanvasManagementViewEntities,
      CanvasManagementViewActions,
      ContextViewState,
      CanvasManagementViewOptions
    >,
    CanvasNavigationMethods {}

const CanvasManagementView: FC<CanvasManagementViewProps> = ({
  entities,
  actions,
  state,
  options,
  backToCanvases,
  buildLinkToCanvas,
}) => {
  const { canvasId } = entities;
  const [canvasBeingDeleted, setCanvasBeingDeleted] = useState<CanvasListItemCanvas | undefined>(undefined);

  const [showCreateCanvasDialog, setShowCreateCanvasDialog] = useState<boolean>(false);
  const { user } = useUserContext();
  const { t } = useTranslation();

  const actualActiveCanvas = useMemo(
    () => (canvasId ? entities.canvases.find(c => c.nameID === canvasId) : undefined),
    [canvasId, entities.canvases]
  );

  const isCanvasCheckedoutByMe =
    actualActiveCanvas?.checkout?.status === CanvasCheckoutStateEnum.CheckedOut &&
    actualActiveCanvas.checkout.lockedBy === user?.user.id;
  const isCanvasAvailable = actualActiveCanvas?.checkout?.status === CanvasCheckoutStateEnum.Available;

  const buildCanvasUrl = useCallback(
    (canvas: CanvasDetailsFragment) => buildLinkToCanvas(canvas.nameID),
    [buildLinkToCanvas]
  );

  return (
    <>
      <CanvasesDashboardSection
        canvases={entities.canvases}
        headerText={t('pages.canvas.header', { blockName: entities.contextSource })}
        subHeaderText={t('pages.canvas.subheader')}
        noItemsMessage={t('pages.canvas.no-canvases')}
        loading={state.loadingCanvases}
        onCreate={() => setShowCreateCanvasDialog(true)}
        onDelete={canvas => setCanvasBeingDeleted(canvas)}
        buildCanvasUrl={buildCanvasUrl}
        {...options}
      />
      <CanvasValueContainer canvasId={actualActiveCanvas?.id}>
        {entities => (
          <CanvasDialog
            entities={{ canvas: entities.canvas }}
            actions={{
              onCancel: backToCanvases,
              onCheckin: actions.onCheckin,
              onCheckout: actions.onCheckout,
              onUpdate: actions.onUpdate,
            }}
            options={{
              show: Boolean(canvasId),
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
