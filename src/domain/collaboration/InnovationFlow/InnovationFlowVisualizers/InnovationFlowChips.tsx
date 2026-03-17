import { ArrowRight } from '@mui/icons-material';
import { Box, Button, Divider, styled, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import i18n from '@/core/i18n/config';
import type TranslationKey from '@/core/i18n/utils/TranslationKey';
import { useGlobalGridColumns } from '@/core/ui/grid/constants';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import { Caption } from '@/core/ui/typography';
import type { InnovationFlowStateModel } from '../models/InnovationFlowStateModel';
import type { InnovationFlowVisualizerProps } from './InnovationFlowVisualizer';

interface InnovationFlowChipsProps extends InnovationFlowVisualizerProps {}

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
  onSelectState,
  settingsButton,
  createButton,
}: InnovationFlowChipsProps) => {
  const { t } = useTranslation();

  const columns = useGlobalGridColumns();

  const getStateName = (stateName: string) =>
    i18n.exists(`common.enums.innovationFlowState.${stateName}`)
      ? t(`common.enums.innovationFlowState.${stateName}` as TranslationKey)
      : stateName;

  const getStateButtonVariant = (state: InnovationFlowStateModel) => {
    if (state.displayName === selectedState) {
      return 'contained';
    }
    return 'outlined';
  };

  const getStateButtonBackgroundColor = (state: InnovationFlowStateModel) => {
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
      <Gutters row={true} disablePadding={true} alignItems="start" overflow="hidden">
        {settingsButton}
        {settingsButton && <Divider orientation="vertical" flexItem={true} />}
        <Gutters
          row={columns > 4}
          disablePadding={true}
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
              disableElevation={true}
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
              <Caption noWrap={true}>{getStateName(state.displayName)}</Caption>
            </Button>
          ))}
        </Gutters>
        {createButton && (
          <Gutters row={true} disablePadding={true}>
            {createButton}
          </Gutters>
        )}
      </Gutters>
      {selectedStateDescription ? (
        <FlowStateDescription>{selectedStateDescription}</FlowStateDescription>
      ) : (
        // fixes the offset when no description is present
        <Box sx={{ marginBottom: gutters(0.7) }} />
      )}
    </>
  );
};

export default InnovationFlowChips;
