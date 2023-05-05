import { forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildCanvasUrl } from '../../../../common/utils/urlBuilders';
import { WhiteboardTemplate } from '../../../../core/apollo/generated/graphql-schema';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import CalloutLayout, { CalloutLayoutProps } from '../../CalloutBlock/CalloutLayout';
import { BaseCalloutViewProps } from '../CalloutViewTypes';
import { CanvasCardCanvas } from '../canvas/types';
import ImageWithCaption from '../../../shared/components/ImageWithCaption';
import { useTranslation } from 'react-i18next';

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
      ...calloutLayoutProps
    },
    ref
  ) => {
    const { t } = useTranslation();
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

    return (
      <>
        <PageContentBlock ref={ref} disablePadding disableGap {...blockProps}>
          <CalloutLayout callout={callout} contributionsCount={contributionsCount} {...calloutLayoutProps}>
            {callout.canvases.map(canvas => {
              return (
                <ImageWithCaption
                  key={canvas.id}
                  caption={t('callout.single-whiteboard.click-to-see')}
                  src={canvas.profile.visual?.uri}
                  alt={canvas.profile.displayName}
                  onClick={() => navigateToCanvas(canvas)}
                />
              );
            })}
          </CalloutLayout>
        </PageContentBlock>
      </>
    );
  }
);

export default SingleWhiteboardCallout;
