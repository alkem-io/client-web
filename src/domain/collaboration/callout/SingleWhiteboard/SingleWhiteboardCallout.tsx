import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { WhiteboardTemplate } from '../../../../core/apollo/generated/graphql-schema';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import ImageWithCaption from '../../../shared/components/ImageWithCaption';
import CalloutLayout, { CalloutLayoutProps } from '../../CalloutBlock/CalloutLayout';
import CanvasDialog from '../../canvas/CanvasDialog/CanvasDialog';
import CanvasValueContainer from '../../canvas/containers/CanvasValueContainer';
import { BaseCalloutViewProps } from '../CalloutViewTypes';
import { CanvasCardCanvas } from '../canvas/types';

interface SingleWhiteboardCalloutProps extends BaseCalloutViewProps {
  callout: CalloutLayoutProps['callout'] & {
    canvases: CanvasCardCanvas[];
    whiteboardTemplate: WhiteboardTemplate;
  };
}

const SingleWhiteboardCallout = forwardRef<HTMLDivElement, SingleWhiteboardCalloutProps>(
  (
    {
      callout,
      hubNameId,
      loading,
      challengeNameId,
      opportunityNameId,
      contributionsCount,
      blockProps,
      onExpand,
      expanded,
      ...calloutLayoutProps
    },
    ref
  ) => {
    const { t } = useTranslation();

    const firstCanvas = callout.canvases[0];

    if (!callout.canvases || callout.canvases.length !== 1) {
      return null;
    }

    return (
      <>
        {expanded ? (
          // TODO: THIS PROBABLY SHOULD BE THE CanvasManagementView to be able to update it... will check on monday
          <CanvasValueContainer
            canvasId={firstCanvas.id}
            calloutId={callout.id}
            hubNameId={hubNameId}
            challengeNameId={challengeNameId}
            opportunityNameId={opportunityNameId}
          >
            {entities => (
              <CanvasDialog
                entities={{
                  canvas: entities.canvas,
                }}
                actions={{
                  onCancel: () => {
                    console.log('onCancel');
                  },
                  onUpdate: () => {},
                }}
                options={{
                  show: true,
                  canCheckout: false,
                  canEdit: false,
                  canDelete: false,
                  checkedOutByMe: false,
                  headerActions: undefined,
                  fixedDialogTitle: 'Canvas',
                }}
              />
            )}
          </CanvasValueContainer>
        ) : (
          <PageContentBlock ref={ref} disablePadding disableGap {...blockProps}>
            <CalloutLayout callout={callout} contributionsCount={contributionsCount} {...calloutLayoutProps}>
              <ImageWithCaption
                caption={t('callout.single-whiteboard.click-to-see')}
                src={firstCanvas.profile.preview?.uri}
                alt={callout.profile.displayName}
                onClick={onExpand}
              />
            </CalloutLayout>
          </PageContentBlock>
        )}
      </>
    );
  }
);

export default SingleWhiteboardCallout;
