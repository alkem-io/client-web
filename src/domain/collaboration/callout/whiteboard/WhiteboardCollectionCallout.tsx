import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CalloutLayout, { CalloutLayoutProps } from '../../CalloutBlock/CalloutLayout';
import ScrollableCardsLayout from '../../../../core/ui/card/cardsLayout/ScrollableCardsLayout';
import WhiteboardActionsContainer from '../../whiteboard/containers/WhiteboardActionsContainer';
import CreateCalloutItemButton from '../CreateCalloutItemButton';
import { CalloutState, CreateContributionOnCalloutInput } from '../../../../core/apollo/generated/graphql-schema';
import { Skeleton } from '@mui/material';
import WhiteboardCard from './WhiteboardCard';
import { buildWhiteboardUrl } from '../../../../main/routing/urlBuilders';
import { WhiteboardCardWhiteboard } from './types';
import { BaseCalloutViewProps } from '../CalloutViewTypes';
import { gutters } from '../../../../core/ui/grid/utils';
import CalloutBlockFooter from '../../CalloutBlock/CalloutBlockFooter';
import useCurrentBreakpoint from '../../../../core/ui/utils/useCurrentBreakpoint';
import WhiteboardDialog from '../../whiteboard/WhiteboardDialog/WhiteboardRtDialog';
import { useFullscreen } from '../../../../core/ui/fullscreen/useFullscreen';

interface WhiteboardCollectionCalloutProps extends BaseCalloutViewProps {
  callout: CalloutLayoutProps['callout'];
}

const WhiteboardCollectionCallout = ({
  callout,
  spaceNameId,
  loading,
  challengeNameId,
  opportunityNameId,
  canCreate = false,
  contributionsCount,
  ...calloutLayoutProps
}: WhiteboardCollectionCalloutProps) => {
  const [showCreateWhiteboardDialog, setShowCreateWhiteboardDialog] = useState(false);
  const navigate = useNavigate();
  const { fullscreen, setFullscreen } = useFullscreen();

  const openCreateDialog = () => {
    setShowCreateWhiteboardDialog(true);
  };
  const closeCreateDialog = () => {
    setShowCreateWhiteboardDialog(false);
    if (fullscreen) {
      setFullscreen(false);
    }
  };

  const createButton = canCreate && callout.contributionPolicy.state !== CalloutState.Closed && (
    <CreateCalloutItemButton onClick={openCreateDialog} />
  );

  const navigateToWhiteboard = (whiteboard: WhiteboardCardWhiteboard) => {
    navigate(
      buildWhiteboardUrl(whiteboard.calloutNameId, whiteboard.nameID, {
        spaceNameId: spaceNameId!,
        challengeNameId,
        opportunityNameId,
      })
    );
  };

  const calloutWhiteboards =
    callout.contributions
      ?.map(contribution =>
        contribution.whiteboard ? { ...contribution.whiteboard, calloutNameId: callout.nameID } : undefined
      )
      .filter(w => w !== undefined) ?? [];

  const showCards = useMemo(
    () => (!loading && calloutWhiteboards.length > 0) || callout.contributionPolicy.state !== CalloutState.Closed,
    [loading, calloutWhiteboards.length, callout.contributionPolicy.state]
  );

  const breakpoint = useCurrentBreakpoint();

  const isMobile = breakpoint === 'xs';

  return (
    <>
      <CalloutLayout callout={callout} contributionsCount={contributionsCount} {...calloutLayoutProps} disableMarginal>
        {showCards && (
          <ScrollableCardsLayout
            items={loading ? [undefined, undefined] : calloutWhiteboards}
            deps={[spaceNameId, challengeNameId, opportunityNameId]}
            createButton={!isMobile && createButton}
            maxHeight={gutters(22)}
          >
            {whiteboard =>
              whiteboard ? (
                <WhiteboardCard key={whiteboard.id} whiteboard={whiteboard} onClick={navigateToWhiteboard} />
              ) : (
                <Skeleton />
              )
            }
          </ScrollableCardsLayout>
        )}
        {isMobile && canCreate && callout.contributionPolicy.state !== CalloutState.Closed && (
          <CalloutBlockFooter contributionsCount={contributionsCount} onCreate={openCreateDialog} />
        )}
      </CalloutLayout>
      <WhiteboardActionsContainer>
        {(entities, actionsState, actions) => (
          <WhiteboardDialog
            entities={{
              whiteboard: {
                profile: {
                  id: '',
                  displayName: '',
                  storageBucket: {
                    // TODO: When creating a whiteboard a StorageBucketId is needed if we want to allow image uploading
                    // For now we are allowing files attached to the newly created whiteboards, so we can pass
                    // an empty string here, and allowFilesAttached = true in the options
                    id: '',
                  },
                },
                content: callout.contributionDefaults.whiteboardContent ?? '',
              },
            }}
            actions={{
              onCancel: closeCreateDialog,
              onUpdate: (input, previewImages) => {
                setShowCreateWhiteboardDialog(false);
                return actions.onCreate(
                  {
                    whiteboard: {
                      content: input.content,
                      profileData: {
                        displayName: input.profile.displayName,
                      },
                    },
                    calloutID: callout.id,
                  } as CreateContributionOnCalloutInput,
                  previewImages
                );
              },
            }}
            options={{
              show: showCreateWhiteboardDialog,
              canEdit: true,
              allowFilesAttached: true,
              fullscreen,
            }}
            state={{}}
          />
        )}
      </WhiteboardActionsContainer>
    </>
  );
};

export default WhiteboardCollectionCallout;
