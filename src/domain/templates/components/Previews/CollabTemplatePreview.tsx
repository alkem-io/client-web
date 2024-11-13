import { Accordion, AccordionDetails, AccordionSummary, Box, styled } from '@mui/material';
import { FC, useEffect, useState } from 'react';
import PageContentBlock from '@core/ui/content/PageContentBlock';
import Loading from '@core/ui/loading/Loading';
import { InnovationFlowState } from '../../../collaboration/InnovationFlow/InnovationFlow';
import InnovationFlowChips from '../../../collaboration/InnovationFlow/InnovationFlowVisualizers/InnovationFlowChips';
import { CalloutType } from '@core/apollo/generated/graphql-schema';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Text, CaptionSmall } from '@core/ui/typography';
import { useTranslation } from 'react-i18next';
import { getCalloutTypeIcon } from '../../../collaboration/callout/calloutCard/calloutIcons';
import WrapperMarkdown from '@core/ui/markdown/WrapperMarkdown';
import RoundedIcon from '@core/ui/icon/RoundedIcon';
import { gutters } from '@core/ui/grid/utils';
import WhiteboardPreview from '../../../collaboration/whiteboard/WhiteboardPreview/WhiteboardPreview';

interface CalloutPreview {
  id: string;
  type: CalloutType;
  framing: {
    profile: {
      displayName: string;
      description?: string;
      flowStateTagset?: {
        tags: string[];
      };
    };
    whiteboard?: {
      profile: {
        preview?: {
          uri: string;
        };
      };
    };
  };
  sortOrder: number;
}

interface CollaborationTemplatePreviewProps {
  loading?: boolean;
  template?: {
    collaboration?: {
      innovationFlow?: {
        states: InnovationFlowState[];
      };
      callouts?: CalloutPreview[];
    };
  };
}

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  marginBottom: gutters(1)(theme),
  boxShadow: 'none',
}));

const CalloutDescription = ({ callout }: { callout: CalloutPreview }) => {
  const { t } = useTranslation();

  switch (callout.type) {
    case CalloutType.Whiteboard:
    case CalloutType.WhiteboardCollection:
      if (callout.framing.whiteboard?.profile.preview?.uri) {
        return (
          <WhiteboardPreview
            whiteboard={callout.framing.whiteboard}
            displayName={callout.framing.profile.displayName}
          />
        );
      }
      return null;
    default:
      return callout.framing.profile.description?.trim() ? (
        <WrapperMarkdown>{callout.framing.profile.description}</WrapperMarkdown>
      ) : (
        <CaptionSmall>{t('common.noDescription')}</CaptionSmall>
      );
  }
};

const CollaborationTemplatePreview: FC<CollaborationTemplatePreviewProps> = ({ template, loading }) => {
  const [selectedState, setSelectedState] = useState<string | undefined>(undefined);
  const [selectedCallout, setSelectedCallout] = useState<string | false>(false);
  const templateStates = template?.collaboration?.innovationFlow?.states ?? [];

  const handleSelectedCalloutChange = (calloutId: string) => (_event, isExpanded: boolean) =>
    setSelectedCallout(isExpanded ? calloutId : false);

  useEffect(() => {
    if (!selectedState && templateStates.length > 0) {
      setSelectedState(templateStates[0]?.displayName);
    }
  }, [selectedState, templateStates]);

  return (
    <PageContentBlock>
      {loading && (
        <Box textAlign="center">
          <Loading />
        </Box>
      )}
      {!loading && (
        <InnovationFlowChips
          states={templateStates}
          selectedState={selectedState}
          onSelectState={state => setSelectedState(state.displayName)}
        />
      )}
      {!loading && template?.collaboration?.callouts && (
        <Box>
          {template?.collaboration?.callouts
            .filter(
              callout =>
                selectedState &&
                callout.framing.profile.flowStateTagset?.tags &&
                callout.framing.profile.flowStateTagset?.tags.includes(selectedState)
            )
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map(callout => {
              return (
                <StyledAccordion
                  key={callout.id}
                  expanded={selectedCallout === callout.id}
                  onChange={handleSelectedCalloutChange(callout.id)}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <RoundedIcon
                      size="small"
                      component={getCalloutTypeIcon({ type: callout.type, contributionPolicy: undefined })}
                    />
                    <Text marginLeft={gutters()}>{callout.framing.profile.displayName}</Text>
                  </AccordionSummary>
                  <AccordionDetails>
                    <CalloutDescription callout={callout} />
                  </AccordionDetails>
                </StyledAccordion>
              );
            })}
        </Box>
      )}
    </PageContentBlock>
  );
};

export default CollaborationTemplatePreview;
