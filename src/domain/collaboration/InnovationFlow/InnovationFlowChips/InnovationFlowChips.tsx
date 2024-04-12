import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, styled, Tooltip } from '@mui/material';
import { ArrowRight } from '@mui/icons-material';
import Gutters from '../../../../core/ui/grid/Gutters';
import { useGlobalGridColumns } from '../../../../core/ui/grid/constants';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import TranslationKey from '../../../../core/i18n/utils/TranslationKey';
import i18n from '../../../../core/i18n/config';
import { InnovationFlowState } from '../InnovationFlow';
import { Caption } from '../../../../core/ui/typography';
import ButtonWithTooltip from '../../../../core/ui/button/ButtonWithTooltip';
import { InnovationFlowIcon } from '../InnovationFlowIcon/InnovationFlowIcon';

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

  const getStateButtonBackgroundColor = (state: InnovationFlowState) => {
    if (state.displayName === selectedState) {
      return 'primary.main';
    }
    return 'background.paper';
  };

  const getStateAriaLabel = (stateName: string) =>
    stateName === currentState
      ? t('components.innovationFlowVisualizer.currentStateName', { state: getStateName(stateName) })
      : (getStateName(stateName) as string);

  const selectedStateDescription = states.find(state => state.displayName === selectedState)?.description;

  return (
    <>
      <Gutters row disablePadding alignItems="start" overflow="hidden">
        <Gutters
          row={columns > 4}
          disablePadding
          flexGrow={1}
          flexShrink={1}
          minWidth={0}
          justifyContent="start"
          flexWrap="wrap"
        >
          {states.map(state => (
            <Button
              key={state.displayName}
              variant={getStateButtonVariant(state)}
              disableElevation
              sx={{
                backgroundColor: getStateButtonBackgroundColor(state),
                borderColor: 'divider',
                '.MuiButton-startIcon': {
                  marginRight: 0,
                },
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
              <Caption noWrap>{getStateName(state.displayName)}</Caption>
            </Button>
          ))}
        </Gutters>
        {showSettings && (
          <ButtonWithTooltip
            onClick={onSettingsOpen}
            tooltip={t('components.innovationFlowSettings.buttonTooltip')}
            variant="outlined"
            iconButton
          >
            <InnovationFlowIcon />
          </ButtonWithTooltip>
        )}
      </Gutters>
      {selectedStateDescription && <FlowStateDescription>{selectedStateDescription}</FlowStateDescription>}
    </>
  );
};

export default InnovationFlowChips;
