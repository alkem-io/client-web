import React, { forwardRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CalloutLayout, { CalloutLayoutProps } from '../../CalloutBlock/CalloutLayout';
import ScrollableCardsLayout from '../../../../core/ui/card/CardsLayout/ScrollableCardsLayout';
import { CalloutState, WhiteboardTemplate } from '../../../../core/apollo/generated/graphql-schema';
import { Skeleton } from '@mui/material';
import { buildCanvasUrl } from '../../../../common/utils/urlBuilders';
import { BaseCalloutViewProps } from '../CalloutViewTypes';
import { gutters } from '../../../../core/ui/grid/utils';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import { CanvasCardCanvas } from '../canvas/types';
import CanvasCard from '../canvas/CanvasCard';

interface WhiteboardCalloutProps extends BaseCalloutViewProps {
  callout: CalloutLayoutProps['callout'] & {
    canvases: CanvasCardCanvas[];
    whiteboardTemplate: WhiteboardTemplate;
  };
}

const WhiteboardCallout = forwardRef<HTMLDivElement, WhiteboardCalloutProps>(
  (
    {
      callout,
      hubNameId,
      loading,
      challengeNameId,
      opportunityNameId,
      contributionsCount,
      blockProps,
      ...calloutLayoutProps
    },
    ref
  ) => {
    const navigate = useNavigate();

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
        <PageContentBlock ref={ref} disablePadding disableGap {...blockProps}>
          <CalloutLayout callout={callout} contributionsCount={contributionsCount} {...calloutLayoutProps}>
            {showCards && (
              <ScrollableCardsLayout
                items={loading ? [undefined, undefined] : callout.canvases}
                deps={[hubNameId, challengeNameId, opportunityNameId]}
                maxHeight={gutters(22)}
                cards={false}
              >
                {canvas =>
                  canvas ? <CanvasCard key={canvas.id} canvas={canvas} onClick={navigateToCanvas} /> : <Skeleton />
                }
              </ScrollableCardsLayout>
            )}
          </CalloutLayout>
        </PageContentBlock>
      </>
    );
  }
);

export default WhiteboardCallout;
