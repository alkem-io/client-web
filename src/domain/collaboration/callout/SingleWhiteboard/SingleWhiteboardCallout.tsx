import { forwardRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { WhiteboardTemplate } from '../../../../core/apollo/generated/graphql-schema';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import ImageWithCaption from '../../../shared/components/ImageWithCaption';
import CalloutLayout, { CalloutLayoutProps } from '../../CalloutBlock/CalloutLayout';
import { BaseCalloutViewProps } from '../CalloutViewTypes';
import { CanvasCardCanvas } from '../canvas/types';
import { CanvasProvider } from '../../canvas/containers/CanvasProvider';
import CanvasesManagementViewWrapper from '../../canvas/CanvasesManagement/CanvasesManagementViewWrapper';
import useBackToParentPage from '../../../shared/utils/useBackToParentPage';
import { useResolvedPath } from 'react-router-dom';

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
    const { t } = useTranslation();
    const parentUrl = useResolvedPath('..').pathname;
    const { calloutUri } = calloutLayoutProps;
    const [, buildLinkToCanvasRaw] = useBackToParentPage(calloutUri, { keepScroll: true });

    const buildLinkToCanvas = useMemo(
      () => (url: string) => {
        return buildLinkToCanvasRaw(`${parentUrl}/${url}`);
      },
      [parentUrl, buildLinkToCanvasRaw]
    );

    if (!callout.canvases || callout.canvases.length < 1) {
      return null;
    }
    const firstCanvas = callout.canvases[0];

    return (
      <>
        {expanded ? (
          <CanvasProvider
            canvasLocation={{
              hubNameId,
              challengeNameId,
              opportunityNameId,
              calloutNameId: callout.nameID,
              whiteboardNameId: firstCanvas.id,
            }}
          >
            {(entities, state) => (
              <CanvasesManagementViewWrapper
                canvasNameId={firstCanvas.id}
                backToCanvases={() => onClose?.()}
                buildLinkToCanvas={buildLinkToCanvas}
                journeyTypeName={journeyTypeName}
                {...entities}
                {...state}
              />
            )}
          </CanvasProvider>
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
