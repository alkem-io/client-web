import {
  CalloutContributionType,
  CalloutFramingType,
  CommunityMembershipStatus,
} from '@/core/apollo/generated/graphql-schema';
import { useScreenSize } from '@/core/ui/grid/constants';
import CommentsComponent from '@/domain/communication/room/Comments/CommentsComponent';
import { useSpace } from '@/domain/space/context/useSpace';
import { CalloutLayoutProps } from '../calloutBlock/CalloutLayoutTypes';
import CalloutSettingsContainer from '../calloutBlock/CalloutSettingsContainer';
import CalloutFramingWhiteboard from '../CalloutFramings/CalloutFramingWhiteboard';
import { BaseCalloutViewProps } from '../CalloutViewTypes';
import CalloutCommentsContainer from './CalloutCommentsContainer';
import CommentsCalloutLayout from './CommentsCalloutLayout';
import CalloutContributionsLink from '../CalloutContributions/link/CalloutContributionsLink';
import CalloutContributionsContainer from '../CalloutContributions/CalloutContributionsContainer';
import CalloutContributionsWhiteboard from '../CalloutContributions/whiteboard/CalloutContributionsWhiteboard';
import CalloutContributionsPost from '../CalloutContributions/post/CalloutContributionsPost';

interface CommentsCalloutProps extends BaseCalloutViewProps {
  callout: CalloutLayoutProps['callout'];
  calloutActions?: boolean;
}

const COMMENTS_CONTAINER_HEIGHT = 400;

const CommentsCallout = ({
  callout,
  loading,
  expanded,
  contributionsCount,
  onExpand,
  onCollapse,
  calloutActions = true,
  onCalloutUpdate,
  ...calloutSettingsProps
}: CommentsCalloutProps) => {
  const { space } = useSpace();
  const myMembershipStatus = space?.about.membership?.myMembershipStatus;

  const { isSmallScreen } = useScreenSize();
  const lastMessageOnly = isSmallScreen && !expanded;

  return (
    <CalloutSettingsContainer callout={callout} expanded={expanded} onExpand={onExpand} {...calloutSettingsProps}>
      {calloutSettingsProvided => (
        <CommentsCalloutLayout
          callout={callout}
          contributionsCount={contributionsCount}
          {...calloutSettingsProvided}
          isMember={myMembershipStatus === CommunityMembershipStatus.Member}
          expanded={expanded}
          onExpand={onExpand}
          onCollapse={onCollapse}
          calloutActions={calloutActions}
        >
          {/* Whiteboard framing */}
          {callout.framing.type === CalloutFramingType.Whiteboard && <CalloutFramingWhiteboard callout={callout} />}
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
                  loading={loading || props.loading}
                  last={lastMessageOnly}
                  maxHeight={expanded ? undefined : COMMENTS_CONTAINER_HEIGHT}
                  onClickMore={onExpand}
                />
              )}
            </CalloutCommentsContainer>
          )}
        </CommentsCalloutLayout>
      )}
    </CalloutSettingsContainer>
  );
};

export default CommentsCallout;
