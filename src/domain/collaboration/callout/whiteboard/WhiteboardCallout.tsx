import React, { forwardRef, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CalloutLayout, { CalloutLayoutProps } from '../../CalloutBlock/CalloutLayout';
import ScrollableCardsLayout from '../../../../core/ui/card/CardsLayout/ScrollableCardsLayout';
import WhiteboardActionsContainer from '../../whiteboard/containers/WhiteboardActionsContainer';
import CreateCalloutItemButton from '../CreateCalloutItemButton';
import {
  CalloutState,
  WhiteboardTemplate,
  CreateWhiteboardOnCalloutInput,
} from '../../../../core/apollo/generated/graphql-schema';
import { Skeleton } from '@mui/material';
import WhiteboardCard from './WhiteboardCard';
import { buildWhiteboardUrl } from '../../../../common/utils/urlBuilders';
import { WhiteboardCardWhiteboard } from './types';
import { BaseCalloutViewProps } from '../CalloutViewTypes';
import { gutters } from '../../../../core/ui/grid/utils';
import CalloutBlockFooter from '../../CalloutBlock/CalloutBlockFooter';
import useCurrentBreakpoint from '../../../../core/ui/utils/useCurrentBreakpoint';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import WhiteboardDialog from '../../whiteboard/WhiteboardDialog/WhiteboardDialog';

interface WhiteboardCalloutProps extends BaseCalloutViewProps {
  callout: CalloutLayoutProps['callout'] & {
    whiteboards: WhiteboardCardWhiteboard[];
    whiteboardTemplate: WhiteboardTemplate;
  };
}

const WhiteboardCallout = forwardRef<HTMLDivElement, WhiteboardCalloutProps>(
  (
    {
      callout,
      hubNameId,
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

    const openCreateDialog = () => {
      setShowCreateWhiteboardDialog(true);
    };
    const closeCreateDialog = () => setShowCreateWhiteboardDialog(false);

    const createButton = canCreate && callout.state !== CalloutState.Closed && (
      <CreateCalloutItemButton onClick={openCreateDialog} />
    );

    const navigateToWhiteboard = (whiteboard: WhiteboardCardWhiteboard) => {
      navigate(
        buildWhiteboardUrl(whiteboard.calloutNameId, whiteboard.nameID, {
          hubNameId: hubNameId!,
          challengeNameId,
          opportunityNameId,
        })
      );
    };

    const showCards = useMemo(
      () => (!loading && callout.whiteboards.length > 0) || callout.state !== CalloutState.Closed,
      [loading, callout.whiteboards.length, callout.state]
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
                items={loading ? [undefined, undefined] : callout.whiteboards}
                deps={[hubNameId, challengeNameId, opportunityNameId]}
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
            {isMobile && canCreate && callout.state !== CalloutState.Closed && (
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
                  value: callout.whiteboardTemplate.value,
                },
              }}
              actions={{
                onCancel: closeCreateDialog,
                onUpdate: (input, previewImages) => {
                  actions.onCreate(
                    {
                      value: input.value,
                      profileData: {
                        displayName: input.profile.displayName,
                      },
                      calloutID: callout.id,
                    } as CreateWhiteboardOnCalloutInput,
                    previewImages
                  );
                  setShowCreateWhiteboardDialog(false);
                },
              }}
              options={{
                show: showCreateWhiteboardDialog,
                canEdit: true,
                checkedOutByMe: true,
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
