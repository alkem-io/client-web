import { AvatarGroup, Tooltip } from '@mui/material';
import Avatar from '@/core/ui/avatar/Avatar';
import { PollOptionModel } from '@/domain/collaboration/poll/models/PollModels';

type Voter = NonNullable<PollOptionModel['voters']>[number];

type PollVoterAvatarsProps = {
  voters: Voter[] | null;
};

const PollVoterAvatars = ({ voters }: PollVoterAvatarsProps) => {
  if (!voters) {
    return null;
  }

  return (
    <AvatarGroup max={5} sx={{ justifyContent: 'flex-end' }}>
      {voters.map(voter => (
        <Tooltip key={voter.id} title={voter.profile.displayName}>
          <Avatar src={voter.profile.visual?.uri} alt={voter.profile.displayName} size="xsmall" />
        </Tooltip>
      ))}
    </AvatarGroup>
  );
};

export default PollVoterAvatars;
