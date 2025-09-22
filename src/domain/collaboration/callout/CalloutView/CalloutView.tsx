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
import { BaseCalloutViewProps } from '../CalloutViewTypes';
import CalloutCommentsContainer from './CalloutCommentsContainer';
import CalloutViewLayout from './CalloutViewLayout';
import CalloutContributionsLink from '../CalloutContributions/link/CalloutContributionsLink';
import CalloutContributionsContainer from '../CalloutContributions/CalloutContributionsContainer';
import CalloutContributionsWhiteboard from '../CalloutContributions/whiteboard/CalloutContributionsWhiteboard';
import CalloutContributionsPost from '../CalloutContributions/post/CalloutContributionsPost';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';
import CalloutFramingLink from '../CalloutFramings/CalloutFramingLink';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { CardHeader, Skeleton } from '@mui/material';
import ContributeCard from '@/core/ui/card/ContributeCard';
import CardFooter from '@/core/ui/card/CardFooter';
import { gutters } from '@/core/ui/grid/utils';
import { CalloutDetailsModelExtended } from '../models/CalloutDetailsModel';
import CalloutContributionPreview from '../CalloutContributions/CalloutContributionPreview/CalloutContributionPreview';

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
  callout: CalloutDetailsModelExtended | undefined;
  contributionId?: string;  // Selected contributionId
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
  ...calloutSettingsProps
}: CalloutViewProps) => {
  const { space } = useSpace();
  const { subspace } = useSubSpace();
  const myMembershipStatus =
    subspace?.about.membership?.myMembershipStatus ?? space?.about.membership?.myMembershipStatus;

  const { isSmallScreen } = useScreenSize();
  const lastMessageOnly = isSmallScreen && !expanded;

  if (!callout || loading) {
    return <CalloutViewSkeleton />;
  }

  return (
    <CalloutSettingsContainer callout={callout} expanded={expanded} onExpand={onExpand} {...calloutSettingsProps}>
      {calloutSettingsProvided => (
        <CalloutViewLayout
          callout={callout}
          contributionsCount={contributionsCount}
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

          {/* Selected Contribution */}
          {contributionId && <CalloutContributionPreview callout={callout} contributionId={contributionId} />}

          {/* Collaborate with links */}
          {callout.settings.contribution.allowedTypes.includes(CalloutContributionType.Link) && (
            <CalloutContributionsContainer
              callout={callout}
              onCalloutUpdate={onCalloutUpdate}
              contributionType={CalloutContributionType.Link}
            >
              {props => (
                <CalloutContributionsLink
                  {...props}
                  callout={callout}
                  expanded={expanded}
                  onExpand={onExpand}
                  onCollapse={onCollapse}
                />
              )}
            </CalloutContributionsContainer>
          )}

          {/* Collaborate with Whiteboards */}
          {callout.settings.contribution.allowedTypes.includes(CalloutContributionType.Whiteboard) && (
            <CalloutContributionsContainer
              callout={callout}
              onCalloutUpdate={onCalloutUpdate}
              contributionType={CalloutContributionType.Whiteboard}
            >
              {props => (
                <CalloutContributionsWhiteboard
                  {...props}
                  callout={callout}
                  expanded={expanded}
                  onExpand={onExpand}
                  onCollapse={onCollapse}
                />
              )}
            </CalloutContributionsContainer>
          )}

          {/* Collaborate with Posts */}
          {callout.settings.contribution.allowedTypes.includes(CalloutContributionType.Post) && (
            <CalloutContributionsContainer
              callout={callout}
              onCalloutUpdate={onCalloutUpdate}
              contributionType={CalloutContributionType.Post}
            >
              {props => (
                <CalloutContributionsPost
                  {...props}
                  callout={callout}
                  expanded={expanded}
                  onExpand={onExpand}
                  onCollapse={onCollapse}
                />
              )}
            </CalloutContributionsContainer>
          )}

          {/* Framing Comments */}
          {callout.comments && (
            <CalloutCommentsContainer callout={callout}>
              {props => (
                <CommentsComponent
                  {...props}
                  commentsEnabled={props.commentsEnabled}
                  loading={loading || props.loading}
                  last={lastMessageOnly}
                  maxHeight={expanded ? undefined : COMMENTS_CONTAINER_HEIGHT}
                  onClickMore={() => onExpand?.(callout)}
                  isMember={myMembershipStatus === CommunityMembershipStatus.Member}
                />
              )}
            </CalloutCommentsContainer>
          )}
        </CalloutViewLayout>
      )}
    </CalloutSettingsContainer>
  );
};

export default CalloutView;
