import type { CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import type { Identifiable } from '@/core/utils/Identifiable';
import type { ReferenceModel } from '@/domain/common/reference/ReferenceModel';
import type { TagsetModel } from '@/domain/common/tagset/TagsetModel';
import type { CommentsWithMessagesModel } from '@/domain/communication/room/models/CommentsWithMessagesModel';
import type { LinkDetails } from '../../calloutContributions/link/models/LinkDetails';
import type { ClassificationTagsetWithAllowedValuesModel } from '../../calloutsSet/Classification/ClassificationTagset.model';
import type { MediaGalleryModel } from '../../mediaGallery/MediaGalleryModel';
import type { MemoModel } from '../../memo/model/MemoModel';
import type { WhiteboardDetails } from '../../whiteboard/WhiteboardDialog/WhiteboardDialog';
import type { CalloutModelExtension, CalloutModelLight } from './CalloutModelLight';
import type { CalloutSettingsModelFull } from './CalloutSettingsModel';
import type { ContributionDefaultsModel } from './ContributionDefaultsModel';
import type { PollDetailsModel } from '../../poll/models/PollModels';

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
    poll?: PollDetailsModel;
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
