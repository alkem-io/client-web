import { InnovationFlowCalloutsPreviewProps } from '@/domain/collaboration/InnovationFlow/InnovationFlowCalloutsPreview';
import { InnovationFlowState } from '@/core/apollo/generated/graphql-schema';
import { SpaceAboutLightModel } from '@/domain/space/about/model/spaceAboutLight.model';
import { SpaceSettingsModel } from '@/domain/space/settings/SpaceSettingsModel';
import { SpaceAboutTileModel } from '@/domain/space/about/model/SpaceAboutTile.model';
import { Identifiable } from '@/core/utils/Identifiable';

export interface TemplateContentSpaceModel extends Identifiable {
  collaboration: Identifiable & {
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
  subspaces?: (Identifiable & {
    about: SpaceAboutTileModel;
  })[];
}
