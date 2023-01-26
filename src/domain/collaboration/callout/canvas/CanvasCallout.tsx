import React, { forwardRef, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CalloutLayout, { CalloutLayoutProps } from '../../CalloutBlock/CalloutLayout';
import ScrollableCardsLayout from '../../../../core/ui/card/CardsLayout/ScrollableCardsLayout';
import CanvasActionsContainer from '../../canvas/containers/CanvasActionsContainer';
import CreateCalloutItemButton from '../CreateCalloutItemButton';
import {
  CalloutState,
  CanvasTemplate,
  CreateCanvasOnCalloutInput,
} from '../../../../core/apollo/generated/graphql-schema';
import { Skeleton } from '@mui/material';
import CanvasCard from './CanvasCard';
import { buildCanvasUrl } from '../../../../common/utils/urlBuilders';
import { CanvasCardCanvas } from './types';
import { BaseCalloutImpl } from '../Types';
import { gutters } from '../../../../core/ui/grid/utils';
import CalloutBlockFooter from '../../CalloutBlock/CalloutBlockFooter';
import useCurrentBreakpoint from '../../../../core/ui/utils/useCurrentBreakpoint';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import CanvasDialog from '../../canvas/CanvasDialog/CanvasDialog';

interface CanvasCalloutProps extends BaseCalloutImpl {
  callout: CalloutLayoutProps['callout'] & {
    canvases: CanvasCardCanvas[];
    canvasTemplate: CanvasTemplate;
  };
}

const CanvasCallout = forwardRef<HTMLDivElement, CanvasCalloutProps>(
  (
    {
      callout,
      calloutNames,
      hubNameId,
      loading,
      challengeNameId,
      opportunityNameId,
      canCreate = false,
      onCalloutEdit,
      onVisibilityChange,
      onCalloutDelete,
      contributionsCount,
    },
    ref
  ) => {
    const [showCreateCanvasDialog, setShowCreateCanvasDialog] = useState(false);
    const navigate = useNavigate();

    const openCreateDialog = () => {
      setShowCreateCanvasDialog(true);
    };
    const closeCreateDialog = () => setShowCreateCanvasDialog(false);

    const createButton = canCreate && callout.state !== CalloutState.Closed && (
      <CreateCalloutItemButton onClick={openCreateDialog} />
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

    const breakpoint = useCurrentBreakpoint();

    const isMobile = breakpoint === 'xs';

    return (
      <>
        <PageContentBlock ref={ref} disablePadding disableGap>
          <CalloutLayout
            callout={callout}
            calloutNames={calloutNames}
            contributionsCount={contributionsCount}
            onVisibilityChange={onVisibilityChange}
            onCalloutEdit={onCalloutEdit}
            onCalloutDelete={onCalloutDelete}
          >
            {showCards && (
              <ScrollableCardsLayout
                items={loading ? [undefined, undefined] : callout.canvases}
                deps={[hubNameId, challengeNameId, opportunityNameId]}
                createButton={!isMobile && createButton}
                maxHeight={gutters(22)}
              >
                {canvas =>
                  canvas ? <CanvasCard key={canvas.id} canvas={canvas} onClick={navigateToCanvas} /> : <Skeleton />
                }
              </ScrollableCardsLayout>
            )}
            {isMobile && <CalloutBlockFooter contributionsCount={contributionsCount} onCreate={openCreateDialog} />}
          </CalloutLayout>
        </PageContentBlock>
        <CanvasActionsContainer>
          {(entities, actionsState, actions) => (
            <CanvasDialog
              entities={{
                canvas: {
                  displayName: '',
                  value: callout.canvasTemplate.value,
                },
              }}
              actions={{
                onCancel: closeCreateDialog,
                onUpdate: input => {
                  actions.onCreate({
                    ...input,
                    calloutID: callout.id,
                  } as CreateCanvasOnCalloutInput);
                  setShowCreateCanvasDialog(false);
                },
              }}
              options={{
                show: showCreateCanvasDialog,
                canEdit: true,
              }}
              state={{}}
            />
          )}
        </CanvasActionsContainer>
      </>
    );
  }
);

export default CanvasCallout;
