import CalloutLayout, { CalloutLayoutEvents, CalloutLayoutProps } from '../CalloutLayout';
import React, { useState } from 'react';
import SimpleCard from '../../shared/components/SimpleCard';
import { WbIncandescentOutlined } from '@mui/icons-material';
import { LinkWithState } from '../../shared/types/LinkWithState';
import CardsLayout from '../../shared/layout/CardsLayout/CardsLayout';
import { OptionalCoreEntityIds } from '../../shared/types/CoreEntityIds';
import CanvasCreateDialog from '../../../common/components/composite/dialogs/CanvasDialog/CanvasCreateDialog';
import { CanvasProvider } from '../../../containers/canvas/CanvasProvider';
import CanvasActionsContainer from '../../../containers/canvas/CanvasActionsContainer';
import CreateCalloutItemButton from '../CreateCalloutItemButton';
import { CanvasFragmentWithCallout } from '../useCallouts';

type NeededFields = 'id' | 'nameID' | 'displayName' | 'preview' | 'calloutNameId';
export type CanvasCard = Pick<CanvasFragmentWithCallout, NeededFields>;

interface CanvasCalloutProps extends OptionalCoreEntityIds, CalloutLayoutEvents {
  callout: CalloutLayoutProps['callout'] & {
    canvases: CanvasCard[];
  };
  buildCanvasUrl: (canvasNameId: string, calloutNameId: string) => LinkWithState;
  loading?: boolean;
  canCreate?: boolean;
}

const CanvasCallout = ({
  callout,
  loading,
  hubNameId,
  challengeNameId,
  opportunityNameId,
  buildCanvasUrl,
  canCreate = false,
  onCalloutEdit,
  onVisibilityChange,
  onCalloutDelete,
}: CanvasCalloutProps) => {
  const [showCreateCanvasDialog, setShowCreateCanvasDialog] = useState(false);
  const handleCreateDialogOpened = () => setShowCreateCanvasDialog(true);
  const handleCreateDialogClosed = () => setShowCreateCanvasDialog(false);

  return (
    <>
      <CalloutLayout
        callout={callout}
        maxHeight={18}
        onVisibilityChange={onVisibilityChange}
        onCalloutEdit={onCalloutEdit}
        onCalloutDelete={onCalloutDelete}
      >
        <CardsLayout
          items={loading ? [undefined, undefined] : callout.canvases}
          deps={[hubNameId, challengeNameId, opportunityNameId]}
          {...(canCreate
            ? {
                createButtonComponent: (
                  <CreateCalloutItemButton onClick={handleCreateDialogOpened}>
                    <SimpleCard to={''}></SimpleCard>
                  </CreateCalloutItemButton>
                ),
              }
            : {})}
        >
          {canvas => (
            <SimpleCard
              key={canvas!.id}
              {...buildCanvasUrl(canvas!.nameID, canvas!.calloutNameId)}
              title={canvas!.displayName}
              imageUrl={canvas!.preview?.uri}
              iconComponent={WbIncandescentOutlined}
            />
          )}
        </CardsLayout>
      </CalloutLayout>
      <CanvasProvider>
        {(entities, state) => (
          <CanvasActionsContainer>
            {(_, actionsState, actions) => (
              <CanvasCreateDialog
                entities={{
                  calloutID: callout.id,
                  templates: entities.templates,
                }}
                actions={{
                  onCancel: handleCreateDialogClosed,
                  onConfirm: input => {
                    actions.onCreate(input);
                    setShowCreateCanvasDialog(false);
                  },
                }}
                options={{
                  show: showCreateCanvasDialog,
                }}
                state={{
                  canvasLoading: state.loadingCanvases,
                  templatesLoading: state.loadingCanvases,
                }}
              />
            )}
          </CanvasActionsContainer>
        )}
      </CanvasProvider>
    </>
  );
};

export default CanvasCallout;
