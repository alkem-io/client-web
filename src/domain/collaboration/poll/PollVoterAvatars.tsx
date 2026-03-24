import { Box, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ActorType } from '@/core/apollo/generated/graphql-schema';
import Avatar from '@/core/ui/avatar/Avatar';
import type { PollOptionModel } from '@/domain/collaboration/poll/models/PollModels';
import ContributorTooltip from '@/domain/community/contributor/ContributorTooltip/ContributorTooltip';

type Voter = NonNullable<PollOptionModel['voters']>[number];

type PollVoterAvatarsProps = {
  voters?: Voter[];
};

const MAX_VISIBLE = 10;

const PollVoterAvatars = ({ voters }: PollVoterAvatarsProps) => {
  const { t } = useTranslation();
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
        <Tooltip title={t('poll.results.votersMore', { count: remaining })} arrow={true}>
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
              marginLeft: '5px !important',
            }}
          >
            +{remaining}
          </Box>
        </Tooltip>
      )}
    </Box>
  );
};

export default PollVoterAvatars;
