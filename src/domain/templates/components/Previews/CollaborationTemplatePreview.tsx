import { Box } from '@mui/material';
import { FC, useState } from 'react';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import Loading from '../../../../core/ui/loading/Loading';
import { InnovationFlowState } from '../../../collaboration/InnovationFlow/InnovationFlow';
import InnovationFlowChips from '../../../collaboration/InnovationFlow/InnovationFlowVisualizers/InnovationFlowChips';
import { CalloutType } from '../../../../core/apollo/generated/graphql-schema';

interface CollaborationTemplatePreviewProps {
  loading?: boolean;
  template?: {
    collaboration?: {
      innovationFlow?: {
        states: InnovationFlowState[];
      };
      callouts?: {
        id: string;
        type: CalloutType;
        framing: {
          profile: {
            displayName: string;
            flowStateTagset?: {
              tags: string[];
            };
          };
        };
      }[];
    };
  };
}

const CollaborationTemplatePreview: FC<CollaborationTemplatePreviewProps> = ({ template, loading }) => {
  const [selectedState, setSelectedState] = useState<string | undefined>(undefined);
  const templateStates = template?.collaboration?.innovationFlow?.states ?? [];

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
          {/* TODO: PENDING //!! */}
          {template?.collaboration?.callouts
            .filter(
              callout =>
                selectedState &&
                callout.framing.profile.flowStateTagset?.tags &&
                callout.framing.profile.flowStateTagset?.tags.includes(selectedState)
            )
            .map(callout => (
              <Box key={callout.id} border="1px solid red">
                {callout.framing.profile.displayName}
              </Box>
            ))}
        </Box>
      )}
    </PageContentBlock>
  );
};

export default CollaborationTemplatePreview;
