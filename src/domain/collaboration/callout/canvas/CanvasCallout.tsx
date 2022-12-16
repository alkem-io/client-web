import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CalloutLayout, { CalloutLayoutProps } from '../CalloutLayout';
import CardsLayout from '../../../shared/layout/CardsLayout/CardsLayout';
import CanvasCreateDialog from '../../canvas/CanvasDialog/CanvasCreateDialog';
import CanvasActionsContainer from '../../canvas/containers/CanvasActionsContainer';
import CreateCalloutItemButton from '../CreateCalloutItemButton';
import CardsLayoutScroller from '../../../shared/layout/CardsLayout/CardsLayoutScroller';
import { CalloutState } from '../../../../core/apollo/generated/graphql-schema';
import { Skeleton } from '@mui/material';
import { useHub } from '../../../challenge/hub/HubContext/useHub';
import CanvasCard from './CanvasCard';
import { buildCanvasUrl } from '../../../../common/utils/urlBuilders';
import ContributeCard from '../../../../core/ui/card/ContributeCard';
import { CanvasCardCanvas } from './types';
import { BaseCalloutImpl } from '../Types';

interface CanvasCalloutProps extends BaseCalloutImpl {
  callout: CalloutLayoutProps['callout'] & {
    canvases: CanvasCardCanvas[];
  };
}

const CanvasCallout = ({
  callout,
  calloutNames,
  loading,
  hubNameId,
  challengeNameId,
  opportunityNameId,
  canCreate = false,
  onCalloutEdit,
  onVisibilityChange,
  onCalloutDelete,
  contributionsCount,
}: CanvasCalloutProps) => {
  const [showCreateCanvasDialog, setShowCreateCanvasDialog] = useState(false);
  const handleCreateDialogOpened = () => setShowCreateCanvasDialog(true);
  const handleCreateDialogClosed = () => setShowCreateCanvasDialog(false);
  const { templates } = useHub();
  const navigate = useNavigate();
  const createButtonComponent = useMemo(
    () =>
      callout.state !== CalloutState.Closed ? (
        <CreateCalloutItemButton onClick={handleCreateDialogOpened}>
          <ContributeCard />
        </CreateCalloutItemButton>
      ) : undefined,
    [callout.state]
  );

  const navigateToCanvas = (canvas: CanvasCardCanvas) => {
    navigate(
      buildCanvasUrl(canvas.calloutNameId, canvas.nameID, {
        hubNameId: hubNameId!,
        challengeNameId,
        opportunityNameId,
      })
    );
  };

  const showCards = useMemo(
    () => (!loading && callout.canvases.length > 0) || callout.state !== CalloutState.Closed,
    [loading, callout.canvases.length, callout.state]
  );

  return (
    <>
      <CalloutLayout
        callout={callout}
        calloutNames={calloutNames}
        contributionsCount={contributionsCount}
        onVisibilityChange={onVisibilityChange}
        onCalloutEdit={onCalloutEdit}
        onCalloutDelete={onCalloutDelete}
      >
        {showCards && (
          <CardsLayoutScroller maxHeight={425}>
            <CardsLayout
              items={loading ? [undefined, undefined] : callout.canvases}
              deps={[hubNameId, challengeNameId, opportunityNameId]}
              {...(canCreate ? { createButtonComponent } : {})}
            >
              {canvas =>
                canvas ? <CanvasCard key={canvas.id} canvas={canvas} onClick={navigateToCanvas} /> : <Skeleton />
              }
            </CardsLayout>
          </CardsLayoutScroller>
        )}
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
