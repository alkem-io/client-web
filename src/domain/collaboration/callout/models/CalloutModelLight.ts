import { AuthorizationPrivilege, CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import { ClassificationTagsetModel } from '../../calloutsSet/Classification/ClassificationTagset.model';
import { MemoModelLight } from '../../memo/model/MemoModelLight';

export interface CalloutModelLight {
  id: string;
  framing: {
    profile: {
      displayName: string;
      description?: string;
      url?: string;
    };
    type: CalloutFramingType;
    whiteboard?: {
      profile: {
        preview?: {
          uri: string;
        };
      };
    };
    memo?: MemoModelLight;
  };
  sortOrder: number;
  activity?: number;
  classification?: {
    flowState?: ClassificationTagsetModel;
  };
}

export type CalloutModelExtension<T> = T & {
  calloutsSetId: string | undefined;
  authorization?: { myPrivileges?: AuthorizationPrivilege[] };
  draft: boolean;
  editable: boolean;
  movable: boolean;
  canBeSavedAsTemplate: boolean;
  classificationTagsets: ClassificationTagsetModel[];
  authorName?: string;
  authorAvatarUri?: string;
  publishedAt?: string;
};

/**
 * Extended CalloutModelLight with additional properties useful for the UI
 * Information queried and extended by the hook useCalloutsSet
 */
export type CalloutModelLightExtended = CalloutModelExtension<CalloutModelLight>;
