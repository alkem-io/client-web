import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { BlockSectionTitle, Caption } from '../../../../../core/ui/typography';
import { InnovationFlowState } from '../../../../collaboration/InnovationFlow/InnovationFlow';

export const SafeInnovationFlowVisualizer = ({ states }: { states: InnovationFlowState[] }) => {
  const { t } = useTranslation();


  //const isValid = useMemo(() => LifecycleDataProvider.validateLifecycleDefinition(definition), [definition]);
  // TODO: Validate states
  const isValid = true;
  return isValid ? (
    <Box>
      {states.map(state => <Caption>{state.displayName}, </Caption>)}
    </Box>
  ) : (
    <Box justifyContent="center">
      <BlockSectionTitle>{t('components.lifecycle.error')}</BlockSectionTitle>
    </Box>
  );
};
