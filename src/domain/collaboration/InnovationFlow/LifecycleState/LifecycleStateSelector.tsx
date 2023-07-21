import { Box, Chip, Skeleton } from '@mui/material';
import { FC } from 'react';
import { BlockSectionTitle } from '../../../../core/ui/typography';
import { useTranslation } from 'react-i18next';
import Gutters from '../../../../core/ui/grid/Gutters';
import useLoadingState from '../../../shared/utils/useLoadingState';
import { gutters } from '../../../../core/ui/grid/utils';

interface LifecycleStateSelectorProps {
  currentState: string | undefined;
  nextEvents?: string[];
  onNextEventClick?: (nextEvent: string) => Promise<unknown> | undefined;
}

const LifecycleStateSelector: FC<LifecycleStateSelectorProps> = ({ currentState, nextEvents, onNextEventClick }) => {
  const { t } = useTranslation();

  const [handleClick, loading] = useLoadingState(async (nextEvent: string) => {
    await onNextEventClick?.(nextEvent);
  });

  return (
    <Gutters>
      <BlockSectionTitle>{t('components.lifecycle.currentState')}</BlockSectionTitle>
      <Box>
        <Chip variant="filled" label={currentState ?? <Skeleton />} color="primary" />
      </Box>
      {nextEvents && (
        <>
          <BlockSectionTitle>{t('components.lifecycle.changeState')}</BlockSectionTitle>
          <Box display="flex" gap={gutters(0.5)}>
            {nextEvents?.map(nextEvent => (
              <Chip
                key={nextEvent}
                disabled={loading}
                sx={{ cursor: loading ? 'progress' : 'pointer' }}
                variant="outlined"
                label={nextEvent}
                color="primary"
                onClick={() => handleClick(nextEvent)}
              />
            ))}
          </Box>
        </>
      )}
    </Gutters>
  );
};

export default LifecycleStateSelector;
