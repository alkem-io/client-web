import { InnovationFlowCalloutsPreviewProps } from '@/domain/collaboration/InnovationFlow/InnovationFlowCalloutsPreview';
import { SpaceAboutLightModel } from '@/domain/space/about/model/spaceAboutLight.model';
import { SpaceSettingsModel } from '@/domain/space/settings/SpaceSettingsModel';
import { SpaceAboutTileModel } from '@/domain/space/about/model/SpaceAboutTile.model';
import { InnovationFlowStateModel } from '@/domain/collaboration/InnovationFlow/models/InnovationFlowStateModel';

export interface TemplateContentSpaceModel {
  id: string;
  collaboration: {
    id: string;
    innovationFlow: {
      id: string;
      states: InnovationFlowStateModel[];
    };
    calloutsSet: {
      callouts: InnovationFlowCalloutsPreviewProps['callouts'];
    };
  };
  about?: SpaceAboutLightModel;
  settings?: SpaceSettingsModel;
  subspaces?: {
    about: SpaceAboutTileModel;
  }[];
}
