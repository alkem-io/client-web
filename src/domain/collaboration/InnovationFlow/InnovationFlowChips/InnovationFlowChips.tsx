import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, IconButton, Tooltip, styled, useTheme } from '@mui/material';
import { ArrowRight } from '@mui/icons-material';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import Gutters from '../../../../core/ui/grid/Gutters';
import { useGlobalGridColumns } from '../../../../core/ui/grid/constants';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import TranslationKey from '../../../../core/i18n/utils/TranslationKey';
import i18n from '../../../../core/i18n/config';
import { InnovationFlowState } from '../InnovationFlow';

interface InnovationFlowChipsProps {
  states: InnovationFlowState[];
  currentState?: string;
  selectedState: string | undefined;
  showSettings?: boolean;
  onSettingsOpen?: () => void;
  onSelectState?: (state: InnovationFlowState) => void;
}

const FlowStateDescription = styled(WrapperMarkdown)(() => ({
  img: {
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
}));

const InnovationFlowChips = ({
  states,
  currentState,
  selectedState,
  showSettings,
  onSettingsOpen,
  onSelectState,
}: InnovationFlowChipsProps) => {
  const { t } = useTranslation();

  const columns = useGlobalGridColumns();
  const theme = useTheme();

  const getStateName = (stateName: string) =>
    i18n.exists(`common.enums.innovationFlowState.${stateName}`)
      ? t(`common.enums.innovationFlowState.${stateName}` as TranslationKey)
      : stateName;

  const getStateButtonVariant = (state: InnovationFlowState) => {
    if (state.displayName === selectedState) {
      return 'contained';
    }
    return 'outlined';
  };

  const getStateButtonSx = (state: InnovationFlowState) => {
    if (state.displayName === selectedState) {
      return {
        '& .MuiButton-startIcon': {
          marginRight: 0,
        },
      };
    }
    if (state.displayName === currentState) {
      return {
        backgroundColor: theme.palette.background.paper,
        borderColor: theme.palette.primary.main,
        '& .MuiButton-startIcon': {
          marginRight: 0,
        },
      };
    }
    return {
      backgroundColor: theme.palette.background.paper,
      borderColor: theme.palette.divider,
    };
  };

  const getStateAriaLabel = (stateName: string) =>
    stateName === currentState
      ? t('components.innovationFlowVisualizer.currentStateName', { state: getStateName(stateName) })
      : (getStateName(stateName) as string);

  const selectedStateDescription = states.find(state => state.displayName === selectedState)?.description;

  return (
    <>
      <Gutters row disablePadding alignItems="start" overflow="hidden">
        <Gutters row={columns > 4} disablePadding flexGrow={1} flexShrink={1} justifyContent="start" flexWrap="wrap">
          {states.map(state => (
            <Button
              key={state.displayName}
              variant={getStateButtonVariant(state)}
              disableElevation
              sx={{
                ...getStateButtonSx(state),
              }}
              startIcon={
                state.displayName === currentState && (
                  <Tooltip title={t('components.innovationFlowVisualizer.currentState')}>
                    <ArrowRight />
                  </Tooltip>
                )
              }
              aria-label={getStateAriaLabel(state.displayName)}
              onClick={() => onSelectState?.(state)}
            >
              {getStateName(state.displayName)}
            </Button>
          ))}
        </Gutters>
        {showSettings && (
          <IconButton
            color="primary"
            onClick={onSettingsOpen}
            aria-label={t('components.innovationFlowSettings.title')}
          >
            <SettingsIcon />
          </IconButton>
        )}
      </Gutters>
      {selectedStateDescription && <FlowStateDescription>{selectedStateDescription}</FlowStateDescription>}
    </>
  );
};

export default InnovationFlowChips;
