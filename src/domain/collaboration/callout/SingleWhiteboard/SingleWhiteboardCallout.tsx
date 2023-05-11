import { forwardRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthorizationPrivilege, WhiteboardTemplate } from '../../../../core/apollo/generated/graphql-schema';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import ImageWithCaption from '../../../shared/components/ImageWithCaption';
import CalloutLayout, { CalloutLayoutProps } from '../../CalloutBlock/CalloutLayout';
import { BaseCalloutViewProps } from '../CalloutViewTypes';
import { CanvasCardCanvas } from '../canvas/types';
import { CanvasProvider } from '../../canvas/containers/CanvasProvider';
import CanvasesManagementViewWrapper from '../../canvas/CanvasesManagement/CanvasesManagementViewWrapper';
import { buildCalloutUrl } from '../../../../common/utils/urlBuilders';
import { CanvasIcon } from '../../canvas/icon/CanvasIcon';

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
    const [isWhiteboardDialogOpen, setIsWhiteboardDialogOpen] = useState(false);
    const handleCloseWhiteboardDialog = () => {
      onClose?.();
      setIsWhiteboardDialogOpen(false);
    };

    if (!callout.canvases || callout.canvases.length < 1) {
      return null;
    }
    const firstCanvas = callout.canvases[0];

    return (
      <PageContentBlock ref={ref} disablePadding disableGap {...blockProps}>
        <CalloutLayout
          callout={callout}
          contributionsCount={contributionsCount}
          {...calloutLayoutProps}
          expanded={expanded}
          onExpand={onExpand}
          onClose={onClose}
        >
          <ImageWithCaption
            caption={t('callout.singleWhiteboard.clickToSee')}
            src={firstCanvas.profile.preview?.uri}
            alt={callout.profile.displayName}
            defaultImage={<CanvasIcon />}
            onClick={() => setIsWhiteboardDialogOpen(true)}
          />
          {isWhiteboardDialogOpen && (
            <CanvasProvider
              {...{
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
                  backToCanvases={handleCloseWhiteboardDialog}
                  journeyTypeName={journeyTypeName}
                  canvasShareUrl={buildCalloutUrl(callout.nameID, {
                    hubNameId,
                    challengeNameId,
                    opportunityNameId,
                  })}
                  readOnlyDisplayName
                  updatePrivilege={AuthorizationPrivilege.Update}
                  {...entities}
                  {...state}
                />
              )}
            </CanvasProvider>
          )}
        </CalloutLayout>
      </PageContentBlock>
    );
  }
);

export default SingleWhiteboardCallout;
