import Gutters from '../../../../core/ui/grid/Gutters';
import { Button, IconButton, useTheme } from '@mui/material';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import { BlockTitle, Caption } from '../../../../core/ui/typography';
import PageContentBlockSeamless from '../../../../core/ui/content/PageContentBlockSeamless';
import { Trans, useTranslation } from 'react-i18next';
import TranslationKey from '../../../../types/TranslationKey';
import { gutters } from '../../../../core/ui/grid/utils';

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
  const { t, i18n } = useTranslation();

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
    return {
      backgroundColor: theme.palette.background.paper,
    };
  };

  const theme = useTheme();

  const getStateName = (state: InnovationFlowState) =>
    i18n.exists(`common.enums.innovationFlowState.${state}`)
      ? t(`common.enums.innovationFlowState.${state}` as TranslationKey)
      : state;

  return (
    <PageContentBlockSeamless disablePadding>
      <Gutters row justifyContent="space-around" flexWrap="wrap">
        {states.map(state => (
          <Button
            key={state}
            variant={getStateButtonVariant(state)}
            disableElevation
            sx={{ textTransform: 'none', minHeight: gutters(2), ...getStateButtonSx(state) }}
            onClick={() => onSelectState?.(state)}
          >
            <BlockTitle fontWeight="bold">{getStateName(state)}</BlockTitle>
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
          <Trans
            i18nKey="components.innovationFlowStateSelector.selectedStateNotice"
            values={{
              currentState: getStateName(currentState),
              selectedState: getStateName(selectedState),
            }}
            components={{ strong: <strong /> }}
            t={t}
          />
        </Caption>
      )}
    </PageContentBlockSeamless>
  );
};

export default InnovationFlowStates;
