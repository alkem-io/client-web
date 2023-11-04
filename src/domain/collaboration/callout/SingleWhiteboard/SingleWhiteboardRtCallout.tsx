/**
 * Just a copy from SingleWhiteboardCallout with:
 * - Added Rt suffix
 * - Changed whiteboards from WhiteboardCardWhiteboard[] to WhiteboardCardWhiteboard
 * - Use WhiteboardRtProvider instead of WhiteboardProvider
 * - WhiteboardsRtManagementViewWrapper
 */
import { forwardRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import ImageWithCaption from '../../../shared/components/ImageWithCaption';
import CalloutLayout, { CalloutLayoutProps } from '../../CalloutBlock/CalloutLayout';
import { BaseCalloutViewProps } from '../CalloutViewTypes';
import { WhiteboardRtProvider } from '../../whiteboard/containers/WhiteboardRtProvider';
import WhiteboardsRtManagementViewWrapper from '../../whiteboard/WhiteboardsManagement/WhiteboardsRtManagementViewWrapper';
import { buildCalloutUrl } from '../../../../main/routing/urlBuilders';
import { WhiteboardIcon } from '../../whiteboard/icon/WhiteboardIcon';

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
    const { t } = useTranslation();

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
          <ImageWithCaption
            caption={t('callout.singleWhiteboard.clickToSee')}
            src={callout.framing.whiteboardRt.profile.preview?.uri}
            alt={callout.framing.profile.displayName}
            defaultImage={<WhiteboardIcon />}
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
