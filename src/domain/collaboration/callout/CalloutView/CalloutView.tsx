import { useRef } from 'react';
import {
  CalloutContributionType,
  CalloutFramingType,
  CommunityMembershipStatus,
} from '@/core/apollo/generated/graphql-schema';
import { useScreenSize } from '@/core/ui/grid/constants';
import CommentsComponent from '@/domain/communication/room/Comments/CommentsComponent';
import { useSpace } from '@/domain/space/context/useSpace';
import CalloutSettingsContainer from '../calloutBlock/CalloutSettingsContainer';
import CalloutFramingWhiteboard from '../CalloutFramings/CalloutFramingWhiteboard';
import CalloutFramingMemo from '../CalloutFramings/CalloutFramingMemo';
import CalloutFramingMediaGallery from '../CalloutFramings/CalloutFramingMediaGallery';
import { BaseCalloutViewProps } from '../CalloutViewTypes';
import useCalloutComments from '../commentsToCallout/useCalloutComments';
import CalloutViewLayout from './CalloutViewLayout';
import CalloutContributionsLink from '../../calloutContributions/link/CalloutContributionsLink';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';
import CalloutFramingLink from '../CalloutFramings/CalloutFramingLink';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { CardHeader, Skeleton } from '@mui/material';
import ContributeCard from '@/core/ui/card/ContributeCard';
import CardFooter from '@/core/ui/card/CardFooter';
import { gutters } from '@/core/ui/grid/utils';
import CalloutContributionPreview from '../../calloutContributions/calloutContributionPreview/CalloutContributionPreview';
import CalloutContributionPreviewPost from '../../calloutContributions/post/CalloutContributionPreviewPost';
import CalloutContributionPreviewWhiteboard from '../../calloutContributions/whiteboard/CalloutContributionPreviewWhiteboard';
import CalloutContributionPreviewMemo from '../../calloutContributions/memo/CalloutContributionPreviewMemo';
import CalloutContributionDialogWhiteboard from '../../calloutContributions/whiteboard/CalloutContributionDialogWhiteboard';
import CalloutContributionDialogPost from '../../calloutContributions/post/CalloutContributionDialogPost';
import CalloutContributionDialogMemo from '../../calloutContributions/memo/CalloutContributionDialogMemo';
import CalloutContributionsHorizontalPager from '../../calloutContributions/CalloutContributionsHorizontalPager';
import PostCard from '../../calloutContributions/post/PostCard';
import ContributionsCardsExpandable from '../../calloutContributions/contributionsCardsExpandable/ContributionsCardsExpandable';
import WhiteboardCard from '../../calloutContributions/whiteboard/WhiteboardCard';
import MemoCard from '../../calloutContributions/memo/MemoCard';
import CreateContributionButtonWhiteboard from '../../calloutContributions/whiteboard/CreateContributionButtonWhiteboard';
import CreateContributionButtonPost from '../../calloutContributions/post/CreateContributionButtonPost';
import CreateContributionButtonMemo from '../../calloutContributions/memo/CreateContributionButtonMemo';
import Gutters from '@/core/ui/grid/Gutters';
import { LocationStateCachedCallout, LocationStateKeyCachedCallout } from '../../CalloutPage/CalloutPage';
import useNavigate from '@/core/routing/useNavigate';
import { AnyContribution } from '../../calloutContributions/interfaces/AnyContributionType';
import CalloutContributionsBlock from '../../calloutContributions/CalloutContributionsBlock';

export const CalloutViewSkeleton = () => (
  <PageContentBlock>
    <Skeleton />
    <ContributeCard>
      <CardHeader title={<Skeleton />} />
      <Skeleton sx={{ height: gutters(8), marginX: gutters() }} />
      <CardFooter>
        <Skeleton width="100%" />
      </CardFooter>
    </ContributeCard>
  </PageContentBlock>
);

interface CalloutViewProps extends BaseCalloutViewProps {
  contributionsCount: number | undefined;
  contributionId?: string; // Selected contributionId
  calloutActions?: boolean;
}

const COMMENTS_CONTAINER_HEIGHT = 400;

const CalloutView = ({
  callout,
  contributionId,
  loading,
  expanded,
  contributionsCount,
  onExpand,
  onCollapse,
  calloutActions = true,
  onCalloutUpdate,
  calloutRestrictions,
  ...calloutSettingsProps
}: CalloutViewProps) => {
  const { space } = useSpace();
  const { subspace } = useSubSpace();
  const navigate = useNavigate();
  const contributionPreviewRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLElement>(null);

  const myMembershipStatus =
    subspace?.about.membership?.myMembershipStatus ?? space?.about.membership?.myMembershipStatus;

  const { isSmallScreen } = useScreenSize();
  const lastMessageOnly = isSmallScreen && !expanded;

  const calloutComments = useCalloutComments(callout);

  if (!callout || loading) {
    return <CalloutViewSkeleton />;
  }

  const handleClickOnContribution = (contribution: AnyContribution) => {
    if (expanded && contributionPreviewRef.current) {
      contributionPreviewRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    const state: LocationStateCachedCallout = {
      [LocationStateKeyCachedCallout]: callout,
      keepScroll: true,
    };
    // TODO: When contribution.type is available, use it to decide which url to use
    const url =
      contribution.whiteboard?.profile.url ?? contribution.post?.profile.url ?? contribution.memo?.profile.url;
    if (url) {
      navigate(url, { state });
    }
  };

  return (
    <CalloutSettingsContainer
      callout={callout}
      expanded={expanded}
      onExpand={onExpand}
      calloutRestrictions={calloutRestrictions}
      {...calloutSettingsProps}
    >
      {calloutSettingsProvided => (
        <CalloutViewLayout
          callout={callout}
          contentRef={scrollerRef}
          {...calloutSettingsProvided}
          expanded={expanded}
          onExpand={onExpand}
          onCollapse={onCollapse}
          calloutActions={calloutActions}
        >
          {/* Whiteboard framing */}
          {callout.framing.type === CalloutFramingType.Whiteboard && <CalloutFramingWhiteboard callout={callout} />}

          {/* Memo framing */}
          {callout.framing.type === CalloutFramingType.Memo && <CalloutFramingMemo callout={callout} />}

          {/* Link framing */}
          {callout.framing.type === CalloutFramingType.Link && <CalloutFramingLink callout={callout} />}

          {/* Media Gallery framing */}
          {callout.framing.type === CalloutFramingType.MediaGallery && <CalloutFramingMediaGallery callout={callout} />}

          {/* Collaborate with links */}
          {callout.settings.contribution.allowedTypes.includes(CalloutContributionType.Link) && (
            <CalloutContributionsLink
              callout={callout}
              expanded={expanded}
              onExpand={onExpand}
              onCollapse={onCollapse}
              onCalloutUpdate={onCalloutUpdate}
              calloutRestrictions={calloutRestrictions}
            />
          )}

          {/* Collaborate with Whiteboards */}
          {callout.settings.contribution.allowedTypes.includes(CalloutContributionType.Whiteboard) && (
            <CalloutContributionsBlock
              callout={callout}
              contributionType={CalloutContributionType.Whiteboard}
              createContributionButtonComponent={CreateContributionButtonWhiteboard}
              calloutRestrictions={calloutRestrictions}
              onCalloutContributionsUpdate={onCalloutUpdate}
            >
              {/* If there is a contributionId show the scroller */}
              {contributionId && (
                <CalloutContributionsHorizontalPager
                  callout={callout}
                  loading={loading}
                  contributionType={CalloutContributionType.Whiteboard}
                  contributionSelectedId={contributionId}
                  cardComponent={WhiteboardCard}
                  onClickOnContribution={handleClickOnContribution}
                />
              )}
              {contributionId && (
                /* Selected Contribution */
                <CalloutContributionPreview
                  key={contributionId}
                  ref={contributionPreviewRef}
                  callout={callout}
                  contributionId={contributionId}
                  previewComponent={CalloutContributionPreviewWhiteboard}
                  dialogComponent={CalloutContributionDialogWhiteboard}
                  openContributionDialogOnLoad
                  calloutRestrictions={calloutRestrictions}
                  onCalloutUpdate={onCalloutUpdate}
                />
              )}
              {/* else show the expandable container with the cards */}
              {!contributionId && (
                <ContributionsCardsExpandable
                  callout={callout}
                  loading={loading}
                  contributionType={CalloutContributionType.Whiteboard}
                  expanded={expanded}
                  onExpand={onExpand}
                  onCollapse={onCollapse}
                  onCalloutUpdate={onCalloutUpdate}
                  contributionCardComponent={WhiteboardCard}
                  onClickOnContribution={handleClickOnContribution}
                />
              )}
            </CalloutContributionsBlock>
          )}

          {/* Collaborate with Posts */}
          {callout.settings.contribution.allowedTypes.includes(CalloutContributionType.Post) && (
            <CalloutContributionsBlock
              callout={callout}
              contributionType={CalloutContributionType.Post}
              createContributionButtonComponent={CreateContributionButtonPost}
              calloutRestrictions={calloutRestrictions}
              onCalloutContributionsUpdate={onCalloutUpdate}
            >
              {/* If there is a contributionId show the scroller */}
              {contributionId && (
                <CalloutContributionsHorizontalPager
                  callout={callout}
                  contributionType={CalloutContributionType.Post}
                  contributionSelectedId={contributionId}
                  cardComponent={PostCard}
                  onClickOnContribution={handleClickOnContribution}
                />
              )}
              {contributionId && (
                /* Selected Contribution */
                <CalloutContributionPreview
                  ref={contributionPreviewRef}
                  callout={callout}
                  contributionId={contributionId}
                  previewComponent={CalloutContributionPreviewPost}
                  dialogComponent={CalloutContributionDialogPost}
                  calloutRestrictions={calloutRestrictions}
                  onCalloutUpdate={onCalloutUpdate}
                />
              )}
              {/* else show the expandable container with the cards */}
              {!contributionId && (
                <ContributionsCardsExpandable
                  callout={callout}
                  contributionType={CalloutContributionType.Post}
                  expanded={expanded}
                  onExpand={onExpand}
                  onCollapse={onCollapse}
                  onCalloutUpdate={onCalloutUpdate}
                  contributionCardComponent={PostCard}
                  onClickOnContribution={handleClickOnContribution}
                />
              )}
            </CalloutContributionsBlock>
          )}

          {/* Collaborate with Memos */}
          {callout.settings.contribution.allowedTypes.includes(CalloutContributionType.Memo) && (
            <CalloutContributionsBlock
              callout={callout}
              contributionType={CalloutContributionType.Memo}
              createContributionButtonComponent={CreateContributionButtonMemo}
              calloutRestrictions={calloutRestrictions}
              onCalloutContributionsUpdate={onCalloutUpdate}
            >
              {/* If there is a contributionId show the scroller */}
              {contributionId && (
                <CalloutContributionsHorizontalPager
                  callout={callout}
                  contributionType={CalloutContributionType.Memo}
                  contributionSelectedId={contributionId}
                  cardComponent={MemoCard}
                  onClickOnContribution={handleClickOnContribution}
                />
              )}
              {contributionId && (
                /* Selected Contribution */
                <CalloutContributionPreview
                  key={contributionId}
                  ref={contributionPreviewRef}
                  callout={callout}
                  contributionId={contributionId}
                  previewComponent={CalloutContributionPreviewMemo}
                  dialogComponent={CalloutContributionDialogMemo}
                  openContributionDialogOnLoad
                  calloutRestrictions={calloutRestrictions}
                  onCalloutUpdate={onCalloutUpdate}
                />
              )}
              {/* else show the expandable container with the cards */}
              {!contributionId && (
                <ContributionsCardsExpandable
                  callout={callout}
                  contributionType={CalloutContributionType.Memo}
                  expanded={expanded}
                  onExpand={onExpand}
                  onCollapse={onCollapse}
                  onCalloutUpdate={onCalloutUpdate}
                  contributionCardComponent={MemoCard}
                  onClickOnContribution={handleClickOnContribution}
                />
              )}
            </CalloutContributionsBlock>
          )}

          {/* Framing Comments */}
          {callout.comments && (
            <Gutters disableVerticalPadding disableGap>
              <CommentsComponent
                {...calloutComments}
                externalScrollRef={expanded ? scrollerRef : undefined}
                commentsEnabled={calloutComments.commentsEnabled}
                loading={loading || calloutComments.loading}
                last={lastMessageOnly}
                maxHeight={expanded ? undefined : COMMENTS_CONTAINER_HEIGHT}
                onClickMore={() => onExpand?.(callout)}
                isMember={myMembershipStatus === CommunityMembershipStatus.Member}
              />
            </Gutters>
          )}
        </CalloutViewLayout>
      )}
    </CalloutSettingsContainer>
  );
};

export default CalloutView;
