/**
 * Just a copy from SingleWhiteboardCallout with:
 * - Added Rt suffix
 * - Changed whiteboards from WhiteboardCardWhiteboard[] to WhiteboardCardWhiteboard
 * - Use WhiteboardRtProvider instead of WhiteboardProvider
 * - WhiteboardsRtManagementViewWrapper
 */
import { ReactNode, forwardRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthorizationPrivilege, WhiteboardTemplate } from '../../../../core/apollo/generated/graphql-schema';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import ImageWithCaption from '../../../shared/components/ImageWithCaption';
import CalloutLayout, { CalloutLayoutProps } from '../../CalloutBlock/CalloutLayout';
import { BaseCalloutViewProps } from '../CalloutViewTypes';
import { WhiteboardCardWhiteboard } from '../whiteboard/types';
import { WhiteboardRtProvider } from '../../whiteboard/containers/WhiteboardRtProvider';
import WhiteboardsRtManagementViewWrapper from '../../whiteboard/WhiteboardsManagement/WhiteboardsRtManagementViewWrapper';
import { buildCalloutUrl } from '../../../../main/routing/urlBuilders';
import { WhiteboardIcon } from '../../whiteboard/icon/WhiteboardIcon';
import { useUserContext } from '../../../community/user';
import { Box } from '@mui/material';

interface SingleWhiteboardRtCalloutProps extends BaseCalloutViewProps {
  callout: CalloutLayoutProps['callout'] & {
    whiteboardRt: WhiteboardCardWhiteboard;
    whiteboardTemplate: WhiteboardTemplate;
  };
}

const DisabledOverlay = ({ disabled, children }: { disabled: boolean; children: ReactNode }) => (
  <Box sx={{ position: 'relative' }}>
    {children}
    {disabled && (
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          background: 'rgba(180,180,180, 0.5);',
        }}
      />
    )}
  </Box>
);

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
    const { user } = useUserContext();

    const [isWhiteboardDialogOpen, setIsWhiteboardDialogOpen] = useState(false);
    const handleCloseWhiteboardDialog = () => {
      onClose?.();
      setIsWhiteboardDialogOpen(false);
    };

    if (!callout.whiteboardRt) {
      return null;
    }

    return (
      <PageContentBlock ref={ref} disablePadding disableGap {...blockProps}>
        <DisabledOverlay disabled={!user?.hasPlatformPrivilege(AuthorizationPrivilege.AccessWhiteboardRt)}>
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
              src={callout.whiteboardRt.profile.preview?.uri}
              alt={callout.framing.profile.displayName}
              defaultImage={<WhiteboardIcon />}
              onClick={() => setIsWhiteboardDialogOpen(true)}
            />
            {isWhiteboardDialogOpen && (
              <WhiteboardRtProvider
                {...{
                  spaceId: spaceNameId, // TODO: Should be spaceId in the future, but for now it works
                  calloutId: callout.id,
                  whiteboardNameId: callout.whiteboardRt.id,
                }}
              >
                {(entities, state) => (
                  <WhiteboardsRtManagementViewWrapper
                    whiteboardNameId={callout.whiteboardRt.id}
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
              </WhiteboardRtProvider>
            )}
          </CalloutLayout>
        </DisabledOverlay>
      </PageContentBlock>
    );
  }
);

export default SingleWhiteboardRtCallout;
