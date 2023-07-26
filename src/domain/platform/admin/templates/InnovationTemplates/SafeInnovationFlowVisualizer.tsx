import React, { useMemo } from 'react';
import InnovationFlowVisualizer, { InnovationFlowVisualizerProps } from './InnovationFlowVisualizer';
import { Box } from '@mui/material';
import { BlockSectionTitle } from '../../../../../core/ui/typography';
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

  return isValid ? (
    <InnovationFlowVisualizer lifecycle={lifecycle} />
  ) : (
    <Box justifyContent="center">
      <BlockSectionTitle>{t('components.lifecycle.error')}</BlockSectionTitle>
    </Box>
  );
};
