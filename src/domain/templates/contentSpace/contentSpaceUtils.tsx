import { SpaceSettingsModel } from '@/domain/space/settings/SpaceSettingsModel';
import { EmptyTemplateContentSpaceModel, TemplateContentSpaceModel } from './TemplateContentSpaceModel';
import { SpaceAboutLightModel } from '@/domain/space/about/model/spaceAboutLight.model';
import { InnovationFlowStateModel } from '@/domain/collaboration/InnovationFlow/models/InnovationFlowState';
import { CalloutModelLight } from '@/domain/collaboration/callout/model/CalloutModelLight';

// Type definition for the input data structure
export interface TemplateContentSpaceInputData {
  id?: string;
  about?: SpaceAboutLightModel;
  collaboration?: {
    id?: string;
    innovationFlow?: {
      id?: string;
      states?: InnovationFlowStateModel[];
    };
    calloutsSet?: {
      callouts?: CalloutModelLight[];
    };
  };
  settings?: SpaceSettingsModel;
}

export const mapInputDataToTemplateContentSpaceModel = (
  inputData: TemplateContentSpaceInputData | undefined
): TemplateContentSpaceModel => {
  if (!inputData) {
    return EmptyTemplateContentSpaceModel;
  }
  const result: TemplateContentSpaceModel = {
    id: inputData?.id || '',
    about: inputData?.about,
    collaboration: {
      id: inputData?.collaboration?.id || '',
      innovationFlow: {
        id: inputData?.collaboration?.innovationFlow?.id || '',
        states: inputData?.collaboration?.innovationFlow?.states || [],
      },
      calloutsSet: {
        callouts: inputData?.collaboration?.calloutsSet?.callouts || [],
      },
    },
    settings: inputData?.settings || undefined,
  };
  return result;
};
