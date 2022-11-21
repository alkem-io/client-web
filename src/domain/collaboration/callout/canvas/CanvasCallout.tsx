import CalloutLayout, { CalloutLayoutEvents, CalloutLayoutProps } from '../CalloutLayout';
import React, { useMemo, useState } from 'react';
import SimpleCard from '../../../shared/components/SimpleCard';
import { WbIncandescentOutlined } from '@mui/icons-material';
import { LinkWithState } from '../../../shared/types/LinkWithState';
import CardsLayout from '../../../shared/layout/CardsLayout/CardsLayout';
import { OptionalCoreEntityIds } from '../../../shared/types/CoreEntityIds';
import CanvasCreateDialog from '../../canvas/CanvasDialog/CanvasCreateDialog';
import CanvasActionsContainer from '../../../../containers/canvas/CanvasActionsContainer';
import CreateCalloutItemButton from '../CreateCalloutItemButton';
import { CanvasFragmentWithCallout } from '../useCallouts';
import CardsLayoutScroller from '../../../shared/layout/CardsLayout/CardsLayoutScroller';
import { CalloutState } from '../../../../models/graphql-schema';
import { Skeleton } from '@mui/material';
import { useHub } from '../../../../hooks';

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
  const { templates } = useHub();
  const createButtonComponent = useMemo(
    () =>
      callout.state !== CalloutState.Closed ? (
        <CreateCalloutItemButton onClick={handleCreateDialogOpened}>
          <SimpleCard to={''} />
        </CreateCalloutItemButton>
      ) : undefined,
    [callout.state]
  );

  return (
    <>
      <CalloutLayout
        callout={callout}
        onVisibilityChange={onVisibilityChange}
        onCalloutEdit={onCalloutEdit}
        onCalloutDelete={onCalloutDelete}
      >
        <CardsLayoutScroller maxHeight={176}>
          <CardsLayout
            items={loading ? [undefined, undefined] : callout.canvases}
            deps={[hubNameId, challengeNameId, opportunityNameId]}
            {...(canCreate ? { createButtonComponent } : {})}
          >
            {canvas =>
              canvas ? (
                <SimpleCard
                  key={canvas.id}
                  {...buildCanvasUrl(canvas.nameID, canvas.calloutNameId)}
                  title={canvas.displayName}
                  imageUrl={canvas.preview?.uri}
                  iconComponent={WbIncandescentOutlined}
                />
              ) : (
                <Skeleton />
              )
            }
          </CardsLayout>
        </CardsLayoutScroller>
      </CalloutLayout>
      <CanvasActionsContainer>
        {(entities, actionsState, actions) => (
          <CanvasCreateDialog
            entities={{
              calloutID: callout.id,
              templates: templates.canvasTemplates,
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
              canvasLoading: loading,
            }}
          />
        )}
      </CanvasActionsContainer>
    </>
  );
};

export default CanvasCallout;
