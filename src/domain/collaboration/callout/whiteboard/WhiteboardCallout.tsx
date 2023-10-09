import React, { forwardRef, useMemo, useState } from 'react';
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
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import WhiteboardDialog from '../../whiteboard/WhiteboardDialog/WhiteboardDialog';
import { useFullscreen } from '../../../../core/ui/fullscreen/useFullscreen';

interface WhiteboardCalloutProps extends BaseCalloutViewProps {
  callout: CalloutLayoutProps['callout'];
}

const WhiteboardCallout = forwardRef<HTMLDivElement, WhiteboardCalloutProps>(
  (
    {
      callout,
      spaceNameId,
      loading,
      challengeNameId,
      opportunityNameId,
      canCreate = false,
      contributionsCount,
      blockProps,
      ...calloutLayoutProps
    },
    ref
  ) => {
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
        <PageContentBlock ref={ref} disablePadding disableGap {...blockProps}>
          <CalloutLayout
            callout={callout}
            contributionsCount={contributionsCount}
            {...calloutLayoutProps}
            disableMarginal
          >
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
        </PageContentBlock>
        <WhiteboardActionsContainer>
          {(entities, actionsState, actions) => (
            <WhiteboardDialog
              entities={{
                whiteboard: {
                  profile: {
                    id: '',
                    displayName: '',
                  },
                  content: callout.contributionDefaults.whiteboardContent ?? '',
                },
              }}
              actions={{
                onCancel: closeCreateDialog,
                onUpdate: (input, previewImages) => {
                  actions.onCreate(
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
                  setShowCreateWhiteboardDialog(false);
                },
              }}
              options={{
                show: showCreateWhiteboardDialog,
                canEdit: true,
                checkedOutByMe: true,
                fullscreen,
              }}
              state={{}}
            />
          )}
        </WhiteboardActionsContainer>
      </>
    );
  }
);

export default WhiteboardCallout;
