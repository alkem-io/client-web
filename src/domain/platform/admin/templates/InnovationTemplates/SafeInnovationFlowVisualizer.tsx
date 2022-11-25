import React, { useMemo } from 'react';
import InnovationFlowVisualizer, { InnovationFlowVisualizerProps } from './InnovationFlowVisualizer';
import { Box } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { LifecycleDataProvider } from '@alkemio/visualization';

export const SafeInnovationFlowVisualizer = ({ definition }: { definition: string }) => {
  const { t } = useTranslation();

  const lifecycle = useMemo<InnovationFlowVisualizerProps['lifecycle']>(
    () => ({
      machineDef: definition,
    }),
    [definition]
  );

  const isValid = useMemo(() => LifecycleDataProvider.validateLifecycleDefinition(definition), [definition]);

  return (
    <>
      {isValid && <InnovationFlowVisualizer lifecycle={lifecycle} />}
      {!isValid && (
        <Box justifyContent="center">
          <Typography variant={'h4'}>{t('components.lifecycle-visualizer.error')}</Typography>
        </Box>
      )}
    </>
  );
};
