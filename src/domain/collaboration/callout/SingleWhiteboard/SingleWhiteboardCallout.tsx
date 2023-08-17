import { forwardRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthorizationPrivilege, WhiteboardTemplate } from '../../../../core/apollo/generated/graphql-schema';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import ImageWithCaption from '../../../shared/components/ImageWithCaption';
import CalloutLayout, { CalloutLayoutProps } from '../../CalloutBlock/CalloutLayout';
import { BaseCalloutViewProps } from '../CalloutViewTypes';
import { WhiteboardCardWhiteboard } from '../whiteboard/types';
import { WhiteboardProvider } from '../../whiteboard/containers/WhiteboardProvider';
import WhiteboardsManagementViewWrapper from '../../whiteboard/WhiteboardsManagement/WhiteboardsManagementViewWrapper';
import { buildCalloutUrl } from '../../../../common/utils/urlBuilders';
import { WhiteboardIcon } from '../../whiteboard/icon/WhiteboardIcon';

interface SingleWhiteboardCalloutProps extends BaseCalloutViewProps {
  callout: CalloutLayoutProps['callout'] & {
    whiteboards: WhiteboardCardWhiteboard[];
    whiteboardTemplate: WhiteboardTemplate;
  };
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
    const { t } = useTranslation();
    const [isWhiteboardDialogOpen, setIsWhiteboardDialogOpen] = useState(false);
    const handleCloseWhiteboardDialog = () => {
      onClose?.();
      setIsWhiteboardDialogOpen(false);
    };

    if (!callout.whiteboards || callout.whiteboards.length < 1) {
      return null;
    }
    const firstWhiteboard = callout.whiteboards[0];

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
            src={firstWhiteboard.profile.preview?.uri}
            alt={callout.profile.displayName}
            defaultImage={<WhiteboardIcon />}
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
                  updatePrivilege={AuthorizationPrivilege.Contribute}
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
