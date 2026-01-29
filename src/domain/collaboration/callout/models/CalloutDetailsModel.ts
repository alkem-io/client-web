import { CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import { ReferenceModel } from '@/domain/common/reference/ReferenceModel';
import { TagsetModel } from '@/domain/common/tagset/TagsetModel';
import { WhiteboardDetails } from '../../whiteboard/WhiteboardDialog/WhiteboardDialog';
import { MemoModel } from '../../memo/model/MemoModel';
import { ClassificationTagsetWithAllowedValuesModel } from '../../calloutsSet/Classification/ClassificationTagset.model';
import { CalloutSettingsModelFull } from './CalloutSettingsModel';
import { ContributionDefaultsModel } from './ContributionDefaultsModel';
import { CalloutModelExtension, CalloutModelLight } from './CalloutModelLight';
import { LinkDetails } from '../../calloutContributions/link/models/LinkDetails';
import { Identifiable } from '@/core/utils/Identifiable';
import { CommentsWithMessagesModel } from '@/domain/communication/room/models/CommentsWithMessagesModel';
import { MediaGalleryModel } from '../../mediaGallery/MediaGalleryModel';

export type CalloutDetailsModel = CalloutModelLight & {
  framing: {
    profile: {
      id: string;
      displayName: string;
      description?: string;
      tagset?: TagsetModel;
      references?: ReferenceModel[];
      url: string;
      storageBucket: {
        id: string;
      };
    };
    type: CalloutFramingType;
    whiteboard?: WhiteboardDetails;
    memo?: MemoModel;
    link?: LinkDetails;
    mediaGallery?: MediaGalleryModel;
  };
  classification?: {
    flowState?: ClassificationTagsetWithAllowedValuesModel;
  };
  settings: CalloutSettingsModelFull;
  contributionDefaults: ContributionDefaultsModel;
  comments?: CommentsWithMessagesModel | undefined;
  contributions: (Identifiable & { sortOrder: number })[];
};

/**
 * Extended CalloutDetailsModel with additional properties useful for the UI
 * Information queried and extended by the hook useCalloutsSet
 */
export type CalloutDetailsModelExtended = CalloutModelExtension<CalloutDetailsModel>;
