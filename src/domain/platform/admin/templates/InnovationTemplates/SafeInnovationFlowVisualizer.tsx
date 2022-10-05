import React, { useMemo } from 'react';
import InnovationFlowVisualizer, {
  validateLifecycleDefinition,
  InnovationFlowVisualizerProps,
} from './InnovationFlowVisualizer';
import { Box } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

export const SafeInnovationFlowVisualizer = ({ definition }: { definition: string }) => {
  const { t } = useTranslation();

  const lifecycle = useMemo<InnovationFlowVisualizerProps['lifecycle']>(
    () => ({
      machineDef: definition,
    }),
    [definition]
  );

  const error = useMemo(() => validateLifecycleDefinition(definition), [definition]);

  if (!error) {
    return <InnovationFlowVisualizer lifecycle={lifecycle} />;
  }

  return (
    <Box justifyContent="center">
      <Typography variant={'h4'}>{t('components.lifecycle-visualizer.error')}</Typography>
      {error.toString()}
    </Box>
  );
};
