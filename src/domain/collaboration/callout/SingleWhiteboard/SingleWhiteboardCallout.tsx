import { forwardRef, useState } from 'react';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import CalloutLayout, { CalloutLayoutProps } from '../../CalloutBlock/CalloutLayout';
import { BaseCalloutViewProps } from '../CalloutViewTypes';
import { WhiteboardProvider } from '../../whiteboard/containers/WhiteboardProvider';
import WhiteboardsManagementViewWrapper from '../../whiteboard/WhiteboardsManagement/WhiteboardsManagementViewWrapper';
import { buildCalloutUrl } from '../../../../main/routing/urlBuilders';
import WhiteboardPreview from '../../whiteboard/whiteboardPreview/WhiteboardPreview';

interface SingleWhiteboardCalloutProps extends BaseCalloutViewProps {
  callout: CalloutLayoutProps['callout'];
}

const SingleWhiteboardCallout = forwardRef<HTMLDivElement, SingleWhiteboardCalloutProps>(
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

    if (!callout.framing.whiteboard) {
      return null;
    }

    const firstWhiteboard = callout.framing.whiteboard;

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
            whiteboard={firstWhiteboard}
            displayName={callout.framing.profile.displayName}
            onClick={() => setIsWhiteboardDialogOpen(true)}
          />
          {isWhiteboardDialogOpen && (
            <WhiteboardProvider
              {...{
                spaceId: spaceNameId, // TODO: Should be spaceId in the future, but for now it works
                calloutId: callout.id,
                whiteboardNameId: firstWhiteboard.id,
              }}
            >
              {(entities, state) => (
                <WhiteboardsManagementViewWrapper
                  whiteboardNameId={firstWhiteboard.id}
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
            </WhiteboardProvider>
          )}
        </CalloutLayout>
      </PageContentBlock>
    );
  }
);

export default SingleWhiteboardCallout;
