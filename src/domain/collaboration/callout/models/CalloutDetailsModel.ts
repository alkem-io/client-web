import type { CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import type { Identifiable } from '@/core/utils/Identifiable';
import type { ReferenceModel } from '@/domain/common/reference/ReferenceModel';
import type { TagsetModel } from '@/domain/common/tagset/TagsetModel';
import type { CommentsWithMessagesModel } from '@/domain/communication/room/models/CommentsWithMessagesModel';
import type { LinkDetails } from '../../calloutContributions/link/models/LinkDetails';
import type { ClassificationTagsetWithAllowedValuesModel } from '../../calloutsSet/Classification/ClassificationTagset.model';
import type { MediaGalleryModel } from '../../mediaGallery/MediaGalleryModel';
import type { MemoModel } from '../../memo/model/MemoModel';
import type { PollDetailsModel } from '../../poll/models/PollModels';
import type { WhiteboardDetails } from '../../whiteboard/WhiteboardDialog/WhiteboardDialog.model';
import type { CalloutModelExtension, CalloutModelLight } from './CalloutModelLight';
import type { CalloutSettingsModelFull } from './CalloutSettingsModel';
import type { ContributionDefaultsModel } from './ContributionDefaultsModel';

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
    collaboraDocument?: {
      id: string;
      documentType: string;
      profile?: {
        id: string;
        displayName: string;
        url: string;
      };
    };
  };
  classification?: {
    flowState?: ClassificationTagsetWithAllowedValuesModel;
  };
  settings: CalloutSettingsModelFull;
  contributionDefaults: ContributionDefaultsModel;
  comments?: CommentsWithMessagesModel | undefined;
  contributions: CalloutContributionStub[];
};

type TitledStub = {
  id: string;
  profile: {
    id: string;
    displayName: string;
    /** Markdown — preview material only (rendered clamped to one line). */
    description?: string;
  };
};

/**
 * Contribution stub carried by the `CalloutDetails` fragment: sort order plus
 * a title + description-preview stub of the contributed entity (exactly one is
 * set), so the delete confirmation can name contributions without an extra
 * query (feature 114).
 */
export type CalloutContributionStub = Identifiable & {
  sortOrder: number;
  post?: TitledStub;
  whiteboard?: TitledStub;
  memo?: TitledStub;
  link?: LinkDetails;
  collaboraDocument?: TitledStub;
};

/**
 * Extended CalloutDetailsModel with additional properties useful for the UI
 * Information queried and extended by the hook useCalloutsSet
 */
export type CalloutDetailsModelExtended = CalloutModelExtension<CalloutDetailsModel>;
