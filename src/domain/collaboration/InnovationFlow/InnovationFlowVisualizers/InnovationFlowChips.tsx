import i18n from '@/core/i18n/config';
import TranslationKey from '@/core/i18n/utils/TranslationKey';
import { useGlobalGridColumns } from '@/core/ui/grid/constants';
import Gutters from '@/core/ui/grid/Gutters';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import { Caption } from '@/core/ui/typography';
import { ArrowRight } from '@mui/icons-material';
import { Button, Divider, styled, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { InnovationFlowState } from '../InnovationFlow';
import { InnovationFlowVisualizerProps } from './InnovationFlowVisualizer';

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
              <Caption noWrap>
                <>{getStateName(state.displayName)}</>
              </Caption>
            </Button>
          ))}
        </Gutters>
        {settingsButton}
        {createButton && (
          <Gutters row disablePadding>
            <Divider orientation="vertical" flexItem />
            {createButton}
          </Gutters>
        )}
      </Gutters>
      {selectedStateDescription && <FlowStateDescription>{selectedStateDescription}</FlowStateDescription>}
    </>
  );
};

export default InnovationFlowChips;
