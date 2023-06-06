import { ApolloError } from '@apollo/client';
import React, { FC, useState } from 'react';
import { Trans } from 'react-i18next';
import CanvasDialog from '../CanvasDialog/CanvasDialog';
import ConfirmationDialog from '../../../../core/ui/dialogs/ConfirmationDialog';
import { ICanvasActions } from '../containers/CanvasActionsContainer';
import CanvasValueContainer from '../containers/CanvasValueContainer';
import { useUserContext } from '../../../community/contributor/user';
import {
  CanvasCheckoutStateEnum,
  CanvasDetailsFragment,
  CanvasValueFragment,
  CreateCanvasWhiteboardTemplateFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import { ViewProps } from '../../../../core/container/view';
import { useCanvasLockedByDetailsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import ShareButton from '../../../shared/components/ShareDialog/ShareButton';
import { JourneyTypeName } from '../../../challenge/JourneyTypeName';
import { BlockTitle } from '../../../../core/ui/typography/components';

export interface ActiveCanvasIdHolder {
  canvasNameId?: string;
}

export interface CanvasManagementViewEntities extends ActiveCanvasIdHolder {
  calloutId: string;
  contextSource: JourneyTypeName;
  canvas: CanvasDetailsFragment | undefined;
  templates: CreateCanvasWhiteboardTemplateFragment[];
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
  error?: ApolloError;
}

export interface CanvasManagementViewOptions {
  canUpdate?: boolean;
  canUpdateDisplayName?: boolean;
  canCreate?: boolean;
  canDelete?: boolean;
  shareUrl?: string;
}

export interface CanvasNavigationMethods {
  backToCanvases: () => void;
}

interface CanvasBeingDeleted {
  displayName: string;
  canvasId: string;
  calloutId: string;
}

export interface CanvasManagementViewProps
  extends ViewProps<
      CanvasManagementViewEntities,
      CanvasManagementViewActions,
      ContextViewState,
      CanvasManagementViewOptions
    >,
    CanvasNavigationMethods {}

const CanvasManagementView: FC<CanvasManagementViewProps> = ({ entities, actions, state, options, backToCanvases }) => {
  const { canvasNameId, calloutId, canvas } = entities;
  const [canvasBeingDeleted, setCanvasBeingDeleted] = useState<CanvasBeingDeleted | undefined>(undefined);

  const { user } = useUserContext();

  const isCanvasCheckedOutByMe =
    canvas?.checkout?.status === CanvasCheckoutStateEnum.CheckedOut && canvas.checkout.lockedBy === user?.user.id;

  const isCanvasAvailable = canvas?.checkout?.status === CanvasCheckoutStateEnum.Available;

  const { data: lockedByDetailsData } = useCanvasLockedByDetailsQuery({
    variables: canvas?.checkout?.lockedBy ? { ids: [canvas?.checkout?.lockedBy] } : { ids: [] },
    skip: isCanvasCheckedOutByMe,
  });

  const handleCancel = (canvas: CanvasDetailsFragment) => {
    backToCanvases();
    actions.onCheckin(canvas);
  };

  return (
    <>
      <CanvasValueContainer canvasId={canvas?.id}>
        {entities => (
          <CanvasDialog
            entities={{
              canvas: entities.canvas as CanvasValueFragment & CanvasDetailsFragment,
              lockedBy: lockedByDetailsData?.usersById[0],
            }}
            actions={{
              onCancel: handleCancel,
              onCheckin: actions.onCheckin,
              onCheckout: actions.onCheckout,
              onUpdate: actions.onUpdate,
              onDelete: c => setCanvasBeingDeleted({ canvasId: c.id, displayName: c.profile.displayName, calloutId }),
            }}
            options={{
              show: Boolean(canvasNameId),
              canCheckout: isCanvasAvailable && options.canUpdate,
              canEdit: isCanvasCheckedOutByMe && options.canUpdate,
              canDelete: isCanvasAvailable && options.canDelete,
              checkedOutByMe: isCanvasCheckedOutByMe,
              fixedDialogTitle: options.canUpdateDisplayName ? undefined : (
                <BlockTitle display="flex" alignItems="center">
                  {canvas?.profile.displayName}
                </BlockTitle>
              ),
              headerActions: (
                <ShareButton url={options.shareUrl} entityTypeName="canvas" disabled={!options.shareUrl} />
              ),
            }}
            state={state}
          />
        )}
      </CanvasValueContainer>
      <ConfirmationDialog
        actions={{
          onCancel: () => setCanvasBeingDeleted(undefined),
          onConfirm: async () => {
            if (canvasBeingDeleted) {
              await actions.onDelete({
                ID: canvasBeingDeleted.canvasId,
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
