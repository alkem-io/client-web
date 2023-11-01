import { ApolloError } from '@apollo/client';
import React, { FC } from 'react';
import { IWhiteboardRtActions } from '../containers/WhiteboardRtActionsContainer';
import WhiteboardRtDialog from '../WhiteboardDialog/WhiteboardRtDialog';
import WhiteboardRtContentContainer from '../containers/WhiteboardRtContentContainer';
import {
  WhiteboardRtDetailsFragment,
  WhiteboardRtContentFragment,
  CreateWhiteboardWhiteboardTemplateFragment,
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
  whiteboard: WhiteboardRtDetailsFragment | undefined;
  templates: CreateWhiteboardWhiteboardTemplateFragment[];
  templateListHeader?: string;
  templateListSubheader?: string;
}

export interface WhiteboardManagementViewActions extends IWhiteboardRtActions {}

export interface ContextViewState {
  loadingWhiteboards?: boolean;
  creatingWhiteboard?: boolean;
  changingWhiteboardLockState?: boolean;
  updatingWhiteboard?: boolean;
  error?: ApolloError;
}

export interface WhiteboardManagementViewOptions {
  canUpdate?: boolean;
  canUpdateDisplayName?: boolean;
  canCreate?: boolean;
  shareUrl?: string;
}

export interface WhiteboardNavigationMethods {
  backToWhiteboards: () => void;
}

export interface WhiteboardManagementViewProps
  extends ViewProps<
      WhiteboardManagementViewEntities,
      WhiteboardManagementViewActions,
      ContextViewState,
      WhiteboardManagementViewOptions
    >,
    WhiteboardNavigationMethods {}

const WhiteboardRtManagementView: FC<WhiteboardManagementViewProps> = ({
  entities,
  actions,
  state,
  options,
  backToWhiteboards,
}) => {
  const { whiteboardNameId, whiteboard } = entities;
  const { fullscreen, setFullscreen } = useFullscreen();

  const handleCancel = (/*whiteboard: WhiteboardRtDetailsFragment*/) => {
    backToWhiteboards();
    if (fullscreen) {
      setFullscreen(false);
    }
  };

  return (
    <>
      <WhiteboardRtContentContainer whiteboardId={whiteboard?.id}>
        {entities => {
          return (
            <WhiteboardRtDialog
              entities={{
                whiteboard: entities.whiteboard as WhiteboardRtContentFragment & WhiteboardRtDetailsFragment,
              }}
              actions={{
                onCancel: handleCancel,
                onUpdate: actions.onUpdate,
              }}
              options={{
                canEdit: options.canUpdate,
                show: Boolean(whiteboardNameId),
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
      </WhiteboardRtContentContainer>
    </>
  );
};

export default WhiteboardRtManagementView;
