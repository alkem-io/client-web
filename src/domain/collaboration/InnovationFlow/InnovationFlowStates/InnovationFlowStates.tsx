import Gutters from '../../../../core/ui/grid/Gutters';
import { Button, IconButton, useTheme } from '@mui/material';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import { BlockTitle, Caption } from '../../../../core/ui/typography';
import PageContentBlockSeamless from '../../../../core/ui/content/PageContentBlockSeamless';
import { Trans, useTranslation } from 'react-i18next';
import TranslationKey from '../../../../core/i18n/utils/TranslationKey';
import { gutters } from '../../../../core/ui/grid/utils';
import { useState } from 'react';
import InnovationFlowSettingsDialog from '../InnovationFlowDialogs/InnovationFlowSettingsDialog';
import { useGlobalGridColumns } from '../../../../core/ui/grid/constants';

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
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);

  const getStateButtonVariant = (state: InnovationFlowState) => {
    if (state === selectedState) {
      return 'contained';
    }
    return 'outlined';
  };

  const getStateButtonSx = (state: InnovationFlowState) => {
    if (state === selectedState) {
      return {};
    }
    if (state === currentState) {
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

  const columns = useGlobalGridColumns();

  return (
    <PageContentBlockSeamless disablePadding>
      <Gutters row disablePadding alignItems="center" overflow="hidden">
        <Gutters row={columns > 4} disablePadding flexGrow={1} flexShrink={1} justifyContent="start" flexWrap="wrap">
          {states.map(state => (
            <Button
              key={state}
              variant={getStateButtonVariant(state)}
              disableElevation
              sx={{
                textTransform: 'none',
                minHeight: gutters(2),
                ...getStateButtonSx(state),
              }}
              onClick={() => onSelectState?.(state)}
            >
              <BlockTitle fontWeight="bold">{getStateName(state)}</BlockTitle>
            </Button>
          ))}
        </Gutters>
        {showSettings && (
          <IconButton
            color="primary"
            onClick={() => setShowSettingsDialog(true)}
            aria-label={t('components.select-innovation-flow.innovationFlowSettings')}
          >
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
      <InnovationFlowSettingsDialog open={showSettingsDialog} onClose={() => setShowSettingsDialog(false)} />
    </PageContentBlockSeamless>
  );
};

export default InnovationFlowStates;
