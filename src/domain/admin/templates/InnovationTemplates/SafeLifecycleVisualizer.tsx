import React, { useMemo } from 'react';
import LifecycleVisualizer, {
  validateLifecycleDefinition,
  LifecycleVisualizerProps,
} from '../../../../common/components/core/LifecycleVisualizer';
import { Box } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

export const SafeLifecycleVisualizer = ({ definition }: { definition: string }) => {
  const { t } = useTranslation();

  const lifecycle = useMemo<LifecycleVisualizerProps['lifecycle']>(
    () => ({
      machineDef: definition,
    }),
    [definition]
  );

  const error = useMemo(() => validateLifecycleDefinition(definition), [definition]);

  if (!error) {
    return <LifecycleVisualizer lifecycle={lifecycle} />;
  }

  return (
    <Box justifyContent="center">
      <Typography variant={'h4'}>{t('components.lifecycle-visualizer.error')}</Typography>
      {error.toString()}
    </Box>
  );
};
