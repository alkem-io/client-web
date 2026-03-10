import { Box } from '@mui/material';
import Avatar from '@/core/ui/avatar/Avatar';
import { ActorType } from '@/core/apollo/generated/graphql-schema';
import ContributorTooltip from '@/domain/community/contributor/ContributorTooltip/ContributorTooltip';
import { PollOptionModel } from '@/domain/collaboration/poll/models/PollModels';

type Voter = NonNullable<PollOptionModel['voters']>[number];

type PollVoterAvatarsProps = {
  voters?: Voter[];
};

const MAX_VISIBLE = 5;

const PollVoterAvatars = ({ voters }: PollVoterAvatarsProps) => {
  if (!voters || voters.length === 0) {
    return null;
  }

  const visibleVoters = voters.slice(0, MAX_VISIBLE);
  const remaining = voters.length - MAX_VISIBLE;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        mt: 0.5,
        '& > *:not(:first-of-type)': {
          marginLeft: '-8px',
        },
        '&:hover > *:not(:first-of-type)': {
          marginLeft: '4px',
        },
        '& > *': {
          transition: 'margin-left 0.3s ease',
        },
      }}
    >
      {visibleVoters.map(voter =>
        voter.profile ? (
          <ContributorTooltip key={voter.id} contributorId={voter.id} contributorType={ActorType.User}>
            <Box sx={{ display: 'inline-flex', cursor: 'pointer' }}>
              <Avatar src={voter.profile.visual?.uri} alt={voter.profile.displayName} size="xsmall" />
            </Box>
          </ContributorTooltip>
        ) : null
      )}
      {remaining > 0 && (
        <Box
          sx={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            backgroundColor: 'action.selected',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.625rem',
            color: 'text.secondary',
            fontWeight: 600,
          }}
        >
          +{remaining}
        </Box>
      )}
    </Box>
  );
};

export default PollVoterAvatars;
