import type { Identifiable } from '@/core/utils/Identifiable';
import type { InnovationFlowCalloutsPreviewProps } from '@/domain/collaboration/InnovationFlow/InnovationFlowCalloutsPreview';
import type { InnovationFlowStateModel } from '@/domain/collaboration/InnovationFlow/models/InnovationFlowStateModel';
import type { SpaceAboutTileModel } from '@/domain/space/about/model/SpaceAboutTile.model';
import type { SpaceAboutLightModel } from '@/domain/space/about/model/spaceAboutLight.model';
import type { SpaceSettingsModel } from '@/domain/space/settings/SpaceSettingsModel';

export interface TemplateContentSpaceModel extends Identifiable {
  collaboration: Identifiable & {
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
  subspaces?: (Identifiable & {
    about: SpaceAboutTileModel;
  })[];
}
