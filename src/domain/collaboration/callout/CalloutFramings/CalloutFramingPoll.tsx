import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import Gutters from '@/core/ui/grid/Gutters';
import { usePollSubscriptions } from '@/domain/collaboration/poll/hooks/usePollSubscriptions';
import PollView from '@/domain/collaboration/poll/PollView';
import type { CalloutDetailsModelExtended } from '../models/CalloutDetailsModel';

interface CalloutFramingPollProps {
  callout: CalloutDetailsModelExtended;
}

const CalloutFramingPoll = ({ callout }: CalloutFramingPollProps) => {
  const poll = callout.framing.poll;

  usePollSubscriptions({ pollId: poll?.id });

  if (!poll) {
    return null;
  }

  const canVote = callout.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Contribute) ?? false;

  return (
    <Gutters>
      <PollView poll={poll} canVote={canVote} />
    </Gutters>
  );
};

export default CalloutFramingPoll;
