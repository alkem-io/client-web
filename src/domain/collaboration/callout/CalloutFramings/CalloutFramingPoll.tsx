import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import PollView from '@/domain/collaboration/poll/PollView';
import { CalloutDetailsModelExtended } from '../models/CalloutDetailsModel';

interface CalloutFramingPollProps {
  callout: CalloutDetailsModelExtended;
}

const CalloutFramingPoll = ({ callout }: CalloutFramingPollProps) => {
  const poll = callout.framing.poll;

  if (!poll) {
    return null;
  }

  const canVote = callout.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Contribute) ?? false;

  return <PollView poll={poll} editable={callout.editable} canVote={canVote} />;
};

export default CalloutFramingPoll;
