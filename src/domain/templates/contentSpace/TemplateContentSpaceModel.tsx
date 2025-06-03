import { InnovationFlowCalloutsPreviewProps } from '@/domain/collaboration/callout/CalloutsPreview/InnovationFlowCalloutsPreview';
import { InnovationFlowState } from '@/core/apollo/generated/graphql-schema';
import { SpaceAboutLightModel } from '@/domain/space/about/model/spaceAboutLight.model';
import { SpaceSettingsModel } from '@/domain/space/settings/SpaceSettingsModel';

export interface TemplateContentSpaceModel {
  id: string;
  collaboration: {
    id: string;
    innovationFlow: {
      id: string;
      states: InnovationFlowState[];
    };
    calloutsSet: {
      callouts: InnovationFlowCalloutsPreviewProps['callouts'];
    };
  };
  about?: SpaceAboutLightModel;
  settings?: SpaceSettingsModel;
}

export const EmptyTemplateContentSpaceModel: TemplateContentSpaceModel = {
  id: '',
  collaboration: {
    id: '',
    innovationFlow: { id: '', states: [] },
    calloutsSet: { callouts: [] },
  },
  about: undefined,
};
