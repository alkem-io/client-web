import { Box, Chip, Skeleton } from '@mui/material';
import { FC } from 'react';
import { BlockSectionTitle } from '../../../../core/ui/typography';
import { useTranslation } from 'react-i18next';
import Gutters from '../../../../core/ui/grid/Gutters';
import useLoadingState from '../../../shared/utils/useLoadingState';
import { gutters } from '../../../../core/ui/grid/utils';
import { InnovationFlowState } from '../InnovationFlowStates/InnovationFlowStates';

interface LifecycleStateSelectorProps {
  currentState: string | undefined;
  states?: InnovationFlowState[];
  onStateChange?: (nextEvent: string) => Promise<unknown> | undefined;
}

const LifecycleStateSelector: FC<LifecycleStateSelectorProps> = ({ currentState, states, onStateChange }) => {
  const { t } = useTranslation();

  const [handleClick, loading] = useLoadingState(async (nextEvent: string) => {
    await onStateChange?.(nextEvent);
  });

  return (
    <Gutters>
      <BlockSectionTitle>{t('components.lifecycle.currentState')}</BlockSectionTitle>
      <Box>
        <Chip variant="filled" label={currentState ?? <Skeleton />} color="primary" />
      </Box>
      {states && (
        <>
          <BlockSectionTitle>{t('components.lifecycle.changeState')}</BlockSectionTitle>
          <Box display="flex" gap={gutters(0.5)}>
            {states?.map((state, index) => (
              <Chip
                key={`state_${index}`}
                disabled={loading}
                sx={{ cursor: loading ? 'progress' : 'pointer' }}
                variant="outlined"
                label={state.displayName}
                color="primary"
                onClick={() => handleClick(state.displayName)}
              />
            ))}
          </Box>
        </>
      )}
    </Gutters>
  );
};

export default LifecycleStateSelector;
