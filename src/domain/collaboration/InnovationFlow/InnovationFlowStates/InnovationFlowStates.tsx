import Gutters from '../../../../core/ui/grid/Gutters';
import { Button, IconButton, useTheme } from '@mui/material';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import { BlockTitle, Caption } from '../../../../core/ui/typography';
import PageContentBlockSeamless from '../../../../core/ui/content/PageContentBlockSeamless';
import { useTranslation } from 'react-i18next';

export type InnovationFlowState = string;

interface InnovationFlowStatesProps {
  states: InnovationFlowState[];
  currentState: string;
  selectedState: string;
  showSettings?: boolean;
  onSelectState?: (state: InnovationFlowState) => void;
}

const InnovationFlowStates = ({
  states,
  currentState,
  selectedState,
  showSettings = false,
  onSelectState,
}: InnovationFlowStatesProps) => {
  const { t } = useTranslation();

  const getStateButtonVariant = (state: InnovationFlowState) => {
    if (state === currentState) {
      return 'contained';
    }
    return 'outlined';
  };

  const getStateButtonSx = (state: InnovationFlowState) => {
    if (state === currentState) {
      return {};
    }
    if (state === selectedState) {
      return {
        backgroundColor: theme.palette.highlight.light,
      };
    }
    return {};
  };

  const theme = useTheme();

  return (
    <PageContentBlockSeamless disablePadding>
      <Gutters row justifyContent="space-around">
        {states.map(state => (
          <Button
            key={state}
            variant={getStateButtonVariant(state)}
            disableElevation
            sx={{ textTransform: 'none', ...getStateButtonSx(state) }}
            onClick={() => onSelectState?.(state)}
          >
            <BlockTitle fontWeight="bold">{state}</BlockTitle>
          </Button>
        ))}
        {showSettings && (
          <IconButton color="primary">
            <SettingsIcon />
          </IconButton>
        )}
      </Gutters>
      {selectedState !== currentState && (
        <Caption fontStyle="italic">
          {t('components.innovationFlowStateSelector.selectedStateNotice', { currentState, selectedState })}
        </Caption>
      )}
    </PageContentBlockSeamless>
  );
};

export default InnovationFlowStates;
