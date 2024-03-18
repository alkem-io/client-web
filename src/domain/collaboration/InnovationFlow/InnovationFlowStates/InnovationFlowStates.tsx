import Gutters from '../../../../core/ui/grid/Gutters';
import { Button, IconButton, Tooltip, styled, useTheme } from '@mui/material';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import PageContentBlockSeamless from '../../../../core/ui/content/PageContentBlockSeamless';
import { useTranslation } from 'react-i18next';
import TranslationKey from '../../../../core/i18n/utils/TranslationKey';
import { useState } from 'react';
import InnovationFlowSettingsDialog from '../InnovationFlowDialogs/InnovationFlowSettingsDialog';
import { useGlobalGridColumns } from '../../../../core/ui/grid/constants';
import { InnovationFlowState } from '../InnovationFlow';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import { ArrowRight } from '@mui/icons-material';

interface Props {
  states: InnovationFlowState[] | undefined;
  currentState?: string;
  selectedState: string | undefined;
  onSelectState?: (state: InnovationFlowState) => void;
}

type InnovationFlowStatesProps = Props &
  (
    | {
        showSettings?: false;
        collaborationId?: undefined;
      }
    | {
        showSettings: true;
        collaborationId: string;
      }
  );

const FlowStateDescription = styled(WrapperMarkdown)(() => ({
  img: {
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
}));

const InnovationFlowStates = ({
  collaborationId,
  states = [],
  currentState,
  selectedState,
  showSettings = false,
  onSelectState,
}: InnovationFlowStatesProps) => {
  const { t, i18n } = useTranslation();
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);

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

  const theme = useTheme();

  const getStateName = (stateName: string) =>
    i18n.exists(`common.enums.innovationFlowState.${stateName}`)
      ? t(`common.enums.innovationFlowState.${stateName}` as TranslationKey)
      : stateName;

  const getStateAriaLabel = (stateName: string) =>
    stateName === currentState
      ? t('components.innovationFlowVisualizer.currentStateName', { state: getStateName(stateName) })
      : (getStateName(stateName) as string);

  const columns = useGlobalGridColumns();
  const selectedStateDescription = states.find(state => state.displayName === selectedState)?.description;

  return (
    <PageContentBlockSeamless disablePadding>
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
            onClick={() => setShowSettingsDialog(true)}
            aria-label={t('components.innovationFlowSettings.title')}
          >
            <SettingsIcon />
          </IconButton>
        )}
      </Gutters>
      {selectedStateDescription && <FlowStateDescription>{selectedStateDescription}</FlowStateDescription>}
      <InnovationFlowSettingsDialog
        collaborationId={collaborationId}
        open={showSettingsDialog}
        onClose={() => setShowSettingsDialog(false)}
      />
    </PageContentBlockSeamless>
  );
};

export default InnovationFlowStates;
