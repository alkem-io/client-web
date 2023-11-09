/**
 * Just a copy from SingleWhiteboardCallout with:
 * - Added Rt suffix
 * - Changed whiteboards from WhiteboardCardWhiteboard[] to WhiteboardCardWhiteboard
 * - Use WhiteboardRtProvider instead of WhiteboardProvider
 * - WhiteboardsRtManagementViewWrapper
 */
import { forwardRef, useState } from 'react';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import CalloutLayout, { CalloutLayoutProps } from '../../CalloutBlock/CalloutLayout';
import { BaseCalloutViewProps } from '../CalloutViewTypes';
import { WhiteboardRtProvider } from '../../whiteboard/containers/WhiteboardRtProvider';
import WhiteboardsRtManagementViewWrapper from '../../whiteboard/WhiteboardsManagement/WhiteboardsRtManagementViewWrapper';
import { buildCalloutUrl } from '../../../../main/routing/urlBuilders';
import WhiteboardPreview from '../../whiteboard/whiteboardPreview/WhiteboardPreview';

interface SingleWhiteboardRtCalloutProps extends BaseCalloutViewProps {
  callout: CalloutLayoutProps['callout'];
}

const SingleWhiteboardRtCallout = forwardRef<HTMLDivElement, SingleWhiteboardRtCalloutProps>(
  (
    {
      callout,
      spaceNameId,
      loading,
      challengeNameId,
      opportunityNameId,
      journeyTypeName,
      contributionsCount,
      blockProps,
      onExpand,
      onClose,
      expanded,
      ...calloutLayoutProps
    },
    ref
  ) => {
    const [isWhiteboardDialogOpen, setIsWhiteboardDialogOpen] = useState(false);
    const handleCloseWhiteboardDialog = () => {
      onClose?.();
      setIsWhiteboardDialogOpen(false);
    };

    if (!callout.framing.whiteboardRt) {
      return null;
    }

    return (
      <PageContentBlock ref={ref} disablePadding disableGap {...blockProps}>
        <CalloutLayout
          callout={callout}
          contributionsCount={contributionsCount}
          {...calloutLayoutProps}
          expanded={expanded}
          onExpand={onExpand}
          onClose={onClose}
          journeyTypeName={journeyTypeName}
        >
          <WhiteboardPreview
            whiteboard={callout.framing.whiteboardRt}
            displayName={callout.framing.profile.displayName}
            onClick={() => setIsWhiteboardDialogOpen(true)}
          />
          {isWhiteboardDialogOpen && (
            <WhiteboardRtProvider
              {...{
                spaceId: spaceNameId, // TODO: Should be spaceId in the future, but for now it works
                calloutId: callout.id,
                whiteboardNameId: callout.framing.whiteboardRt.id,
              }}
            >
              {(entities, state) => (
                <WhiteboardsRtManagementViewWrapper
                  whiteboardNameId={callout.framing.whiteboardRt?.id}
                  backToWhiteboards={handleCloseWhiteboardDialog}
                  journeyTypeName={journeyTypeName}
                  whiteboardShareUrl={buildCalloutUrl(callout.nameID, {
                    spaceNameId,
                    challengeNameId,
                    opportunityNameId,
                  })}
                  readOnlyDisplayName
                  {...entities}
                  {...state}
                />
              )}
            </WhiteboardRtProvider>
          )}
        </CalloutLayout>
      </PageContentBlock>
    );
  }
);

export default SingleWhiteboardRtCallout;
