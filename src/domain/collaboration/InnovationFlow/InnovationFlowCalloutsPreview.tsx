import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Accordion, AccordionDetails, AccordionSummary, Box, styled } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RoundedIcon from '@/core/ui/icon/RoundedIcon';
import { gutters } from '@/core/ui/grid/utils';
import { CalloutType } from '@/core/apollo/generated/graphql-schema';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import { Text, CaptionSmall } from '@/core/ui/typography';
import { getCalloutTypeIcon } from '@/domain/collaboration/callout/calloutCard/calloutIcons';
import WhiteboardPreview from '@/domain/collaboration/whiteboard/WhiteboardPreview/WhiteboardPreview';
import { CalloutModelLight } from '../new-callout/models/CalloutModelLight';

export interface InnovationFlowCalloutsPreviewProps {
  selectedState: string | undefined;
  callouts: CalloutModelLight[] | undefined;
  loading?: boolean;
}

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  marginBottom: gutters(1)(theme),
  boxShadow: 'none',
}));

const CalloutDescription = memo(({ callout }: { callout: CalloutModelLight }) => {
  const { t } = useTranslation();

  switch (callout.calloutTypeDeprecated) {
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
});

const InnovationFlowCalloutsPreview = ({ callouts, selectedState, loading }: InnovationFlowCalloutsPreviewProps) => {
  const [selectedCallout, setSelectedCallout] = useState<string | false>(false);
  const handleSelectedCalloutChange = (calloutId: string) => (_event, isExpanded: boolean) =>
    setSelectedCallout(isExpanded ? calloutId : false);

  const visibleCallouts = useMemo(() => {
    return callouts
      ?.filter(
        callout =>
          selectedState &&
          callout.classification?.flowState?.tags &&
          callout.classification?.flowState?.tags.includes(selectedState)
      )
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [callouts, selectedState]);

  return (
    <>
      {!loading && visibleCallouts && (
        <Box>
          {visibleCallouts.map(callout => {
            return (
              <StyledAccordion
                key={callout.id}
                expanded={selectedCallout === callout.id}
                onChange={handleSelectedCalloutChange(callout.id)}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <RoundedIcon
                    size="small"
                    component={getCalloutTypeIcon({
                      calloutTypeDeprecated: callout.calloutTypeDeprecated,
                      settings: undefined,
                    })}
                  />
                  <Text marginLeft={gutters()}>{callout.framing.profile.displayName}</Text>
                </AccordionSummary>
                <AccordionDetails>
                  {selectedCallout === callout.id && <CalloutDescription callout={callout} />}
                </AccordionDetails>
              </StyledAccordion>
            );
          })}
        </Box>
      )}
    </>
  );
};

export default InnovationFlowCalloutsPreview;
