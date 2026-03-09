import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PollResultsDetail } from '@/core/apollo/generated/graphql-schema';
import { PollOptionModel } from '@/domain/collaboration/poll/models/PollModels';
import PollOptionResultRow from '@/domain/collaboration/poll/PollOptionResultRow';
import { Caption } from '@/core/ui/typography';

type PollResultsDisplayProps = {
  options: PollOptionModel[];
  resultsDetail: PollResultsDetail;
  totalVotes: number | null;
  selectedOptionIds: string[];
};

const PollResultsDisplay = ({ options, resultsDetail, totalVotes, selectedOptionIds }: PollResultsDisplayProps) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {totalVotes != null && (
        <Caption color="text.secondary">{t('poll.results.totalVotes', { count: totalVotes })}</Caption>
      )}

      {options.map(option => (
        <PollOptionResultRow
          key={option.id}
          option={option}
          resultsDetail={resultsDetail}
          isSelected={selectedOptionIds.includes(option.id)}
        />
      ))}
    </Box>
  );
};

export default PollResultsDisplay;
