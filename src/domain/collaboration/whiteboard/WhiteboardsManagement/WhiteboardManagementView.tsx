import { ApolloError } from '@apollo/client';
import React, { FC, useState } from 'react';
import { Trans } from 'react-i18next';
import WhiteboardDialog from '../WhiteboardDialog/WhiteboardDialog';
import ConfirmationDialog from '../../../../core/ui/dialogs/ConfirmationDialog';
import { IWhiteboardActions } from '../containers/WhiteboardActionsContainer';
import WhiteboardContentContainer from '../containers/WhiteboardContentContainer';
import {
  WhiteboardDetailsFragment,
  CreateWhiteboardWhiteboardTemplateFragment,
  WhiteboardContentFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import { ViewProps } from '../../../../core/container/view';
import ShareButton from '../../../shared/components/ShareDialog/ShareButton';
import { JourneyTypeName } from '../../../journey/JourneyTypeName';
import { BlockTitle } from '../../../../core/ui/typography/components';
import FullscreenButton from '../../../../core/ui/button/FullscreenButton';
import { useFullscreen } from '../../../../core/ui/fullscreen/useFullscreen';

export interface ActiveWhiteboardIdHolder {
  whiteboardNameId?: string;
}

export interface WhiteboardManagementViewEntities extends ActiveWhiteboardIdHolder {
  calloutId: string;
  contextSource: JourneyTypeName;
  whiteboard: WhiteboardDetailsFragment | undefined;
  templates: CreateWhiteboardWhiteboardTemplateFragment[];
  templateListHeader?: string;
  templateListSubheader?: string;
}

export interface WhiteboardManagementViewActions extends IWhiteboardActions {}

export interface ContextViewState {
  loadingWhiteboards?: boolean;
  creatingWhiteboard?: boolean;
  deletingWhiteboard?: boolean;
  changingWhiteboardLockState?: boolean;
  updatingWhiteboard?: boolean;
  error?: ApolloError;
}

export interface WhiteboardManagementViewOptions {
  canUpdate?: boolean;
  canUpdateDisplayName?: boolean;
  canCreate?: boolean;
  canDelete?: boolean;
  shareUrl?: string;
}

export interface WhiteboardNavigationMethods {
  backToWhiteboards: () => void;
}

interface WhiteboardBeingDeleted {
  displayName: string;
  whiteboardId: string;
  calloutId: string;
}

export interface WhiteboardManagementViewProps
  extends ViewProps<
      WhiteboardManagementViewEntities,
      WhiteboardManagementViewActions,
      ContextViewState,
      WhiteboardManagementViewOptions
    >,
    WhiteboardNavigationMethods {}

const WhiteboardManagementView: FC<WhiteboardManagementViewProps> = ({
  entities,
  actions,
  state,
  options,
  backToWhiteboards,
}) => {
  const { whiteboardNameId, calloutId, whiteboard } = entities;
  const [whiteboardBeingDeleted, setWhiteboardBeingDeleted] = useState<WhiteboardBeingDeleted | undefined>(undefined);
  const { fullscreen, setFullscreen } = useFullscreen();

  const handleCancel = (whiteboard: WhiteboardDetailsFragment) => {
    backToWhiteboards();
    actions.onCheckin(whiteboard);
    if (fullscreen) {
      setFullscreen(false);
    }
  };

  return (
    <>
      <WhiteboardContentContainer whiteboardId={whiteboard?.id}>
        {entities => {
          const { isWhiteboardCheckedOutByMe, isWhiteboardAvailable } = entities;

          return (
            <WhiteboardDialog
              entities={{
                whiteboard: entities.whiteboard as WhiteboardContentFragment & WhiteboardDetailsFragment,
                lockedBy: entities.lockedBy,
              }}
              actions={{
                onCancel: handleCancel,
                onCheckin: actions.onCheckin,
                onCheckout: actions.onCheckout,
                onUpdate: actions.onUpdate,
                onDelete: c =>
                  setWhiteboardBeingDeleted({ whiteboardId: c.id, displayName: c.profile.displayName, calloutId }),
              }}
              options={{
                show: Boolean(whiteboardNameId),
                canCheckout: isWhiteboardAvailable && options.canUpdate,
                canEdit: isWhiteboardCheckedOutByMe && options.canUpdate,
                canDelete: isWhiteboardAvailable && options.canDelete,
                checkedOutByMe: isWhiteboardCheckedOutByMe,
                fixedDialogTitle: options.canUpdateDisplayName ? undefined : (
                  <BlockTitle display="flex" alignItems="center">
                    {whiteboard?.profile.displayName}
                  </BlockTitle>
                ),
                fullscreen,
                headerActions: (
                  <>
                    <ShareButton url={options.shareUrl} entityTypeName="whiteboard" disabled={!options.shareUrl} />
                    <FullscreenButton />
                  </>
                ),
              }}
              state={state}
            />
          );
        }}
      </WhiteboardContentContainer>
      <ConfirmationDialog
        actions={{
          onCancel: () => setWhiteboardBeingDeleted(undefined),
          onConfirm: async () => {
            if (whiteboardBeingDeleted) {
              await actions.onDelete({
                ID: whiteboardBeingDeleted.whiteboardId,
              });
              setWhiteboardBeingDeleted(undefined);
              backToWhiteboards();
            }
          },
        }}
        entities={{
          confirmButtonTextId: 'buttons.delete',
          contentId: 'pages.whiteboard.delete.confirmation-text',
          title: (
            <Trans
              i18nKey="pages.whiteboard.delete.confirmation-title"
              values={{ blockName: whiteboardBeingDeleted?.displayName }}
              components={{ b: <strong /> }}
            />
          ),
        }}
        options={{
          show: Boolean(whiteboardBeingDeleted),
        }}
        state={{
          isLoading: Boolean(state.deletingWhiteboard),
        }}
      />
    </>
  );
};

export default WhiteboardManagementView;
