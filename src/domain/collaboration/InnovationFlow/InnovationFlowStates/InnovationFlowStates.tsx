import Gutters from '../../../../core/ui/grid/Gutters';
import { Button, IconButton, styled, useTheme } from '@mui/material';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import { BlockTitle } from '../../../../core/ui/typography';
import PageContentBlockSeamless from '../../../../core/ui/content/PageContentBlockSeamless';
import { useTranslation } from 'react-i18next';
import TranslationKey from '../../../../core/i18n/utils/TranslationKey';
import { gutters } from '../../../../core/ui/grid/utils';
import { useState } from 'react';
import InnovationFlowSettingsDialog from '../InnovationFlowDialogs/InnovationFlowSettingsDialog';
import { useGlobalGridColumns } from '../../../../core/ui/grid/constants';
import { InnovationFlowState } from '../InnovationFlow';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';

interface InnovationFlowStatesProps {
  collaborationId: string | undefined;
  states: InnovationFlowState[];
  currentState: string;
  selectedState: string;
  showSettings?: boolean;
  onSelectState?: (state: InnovationFlowState) => void;
}

const FlowStateDescription = styled(WrapperMarkdown)(() => ({
  textAlign: 'center',
}));

const InnovationFlowStates = ({
  collaborationId,
  states,
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
      return {};
    }
    if (state.displayName === currentState) {
      return {
        backgroundColor: theme.palette.highlight.light,
      };
    }
    return {
      backgroundColor: theme.palette.background.paper,
    };
  };

  const theme = useTheme();

  const getStateName = (stateName: string) =>
    i18n.exists(`common.enums.innovationFlowState.${stateName}`)
      ? t(`common.enums.innovationFlowState.${stateName}` as TranslationKey)
      : stateName;

  const columns = useGlobalGridColumns();
  const selectedStateDescription = states.find(state => state.displayName === selectedState)?.description;

  return (
    <PageContentBlockSeamless disablePadding>
      <Gutters row disablePadding alignItems="center" overflow="hidden">
        <Gutters row={columns > 4} disablePadding flexGrow={1} flexShrink={1} justifyContent="start" flexWrap="wrap">
          {states.map(state => (
            <Button
              key={state.displayName}
              variant={getStateButtonVariant(state)}
              disableElevation
              sx={{
                textTransform: 'none',
                minHeight: gutters(2),
                ...getStateButtonSx(state),
              }}
              onClick={() => onSelectState?.(state)}
            >
              <BlockTitle fontWeight="bold">{getStateName(state.displayName)}</BlockTitle>
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
