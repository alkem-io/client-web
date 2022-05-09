import { ApolloError } from '@apollo/client';
import React, { FC, useCallback, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import CanvasCreateDialog from '../../../common/components/composite/dialogs/CanvasDialog/CanvasCreateDialog';
import CanvasDialog from '../../../common/components/composite/dialogs/CanvasDialog/CanvasDialog';
import ConfirmationDialog from '../../../common/components/composite/dialogs/ConfirmationDialog';
import { ICanvasActions } from '../../../containers/canvas/CanvasActionsContainer';
import CanvasValueContainer from '../../../containers/canvas/CanvasValueContainer';
import { useUserContext } from '../../../hooks';
import { CanvasCheckoutStateEnum, CreateCanvasCanvasTemplateFragment } from '../../../models/graphql-schema';
import { ViewProps } from '../../../models/view';
import CanvasesDashboardSection from '../CanvasesDashboardSection/CanvasesDashboardSection';
import { LinkWithState } from '../../shared/types/LinkWithState';
import { CanvasFragmentWithCallout } from '../../callout/useCallouts';

export interface ActiveCanvasIdHolder {
  canvasNameId?: string;
}

export interface CanvasManagementViewEntities extends ActiveCanvasIdHolder {
  calloutId: string;
  contextSource: 'hub' | 'challenge' | 'opportunity';
  canvases: CanvasFragmentWithCallout[];
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
  buildLinkToCanvas: (canvasNameId: string, calloutNameId: string) => LinkWithState;
}

export interface CanvasBeingDeleted {
  displayName: string;
  canvasID: string;
  calloutID: string;
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
  const { canvasNameId, calloutId: calloutID } = entities;
  const [canvasBeingDeleted, setCanvasBeingDeleted] = useState<CanvasBeingDeleted | undefined>(undefined);

  const [showCreateCanvasDialog, setShowCreateCanvasDialog] = useState<boolean>(false);
  const { user } = useUserContext();
  const { t } = useTranslation();

  const actualActiveCanvas = useMemo(
    () => (canvasNameId ? entities.canvases.find(c => c.nameID === canvasNameId) : undefined),
    [canvasNameId, entities.canvases]
  );

  const isCanvasCheckedoutByMe =
    actualActiveCanvas?.checkout?.status === CanvasCheckoutStateEnum.CheckedOut &&
    actualActiveCanvas.checkout.lockedBy === user?.user.id;
  const isCanvasAvailable = actualActiveCanvas?.checkout?.status === CanvasCheckoutStateEnum.Available;

  const buildCanvasUrl = useCallback(
    (canvasNameId: string, calloutNameId: string) => buildLinkToCanvas(canvasNameId, calloutNameId),
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
        buildCanvasUrl={buildCanvasUrl}
        {...options}
      />
      <CanvasValueContainer canvasId={actualActiveCanvas?.id} calloutId={calloutID}>
        {entities => (
          <CanvasDialog
            entities={{ canvas: entities.canvas }}
            actions={{
              onCancel: backToCanvases,
              onCheckin: actions.onCheckin,
              onCheckout: actions.onCheckout,
              onUpdate: actions.onUpdate,
              onDelete: c => setCanvasBeingDeleted({ canvasID: c.id, displayName: c.displayName, calloutID }),
            }}
            options={{
              show: Boolean(canvasNameId),
              canCheckout: isCanvasAvailable && options.canUpdate,
              canEdit: isCanvasCheckedoutByMe && options.canUpdate,
              canDelete: isCanvasAvailable && options.canDelete,
            }}
            state={state}
          />
        )}
      </CanvasValueContainer>
      <CanvasCreateDialog
        entities={{
          calloutID: calloutID,
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
              await actions.onDelete({
                ID: canvasBeingDeleted.canvasID,
              });
              setCanvasBeingDeleted(undefined);
              backToCanvases();
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
