import { AuthorizationPrivilege, ContentUpdatePolicy } from '@/core/apollo/generated/graphql-schema';
import { VisualModel } from '@/domain/common/visual/model/VisualModel';

export interface MemoModel {
  id: string;
  contentUpdatePolicy?: ContentUpdatePolicy;
  authorization?: {
    myPrivileges?: AuthorizationPrivilege[];
  };
  profile: {
    displayName: string;
    preview?: VisualModel;
    url?: string;
  };
  createdBy?: {
    id: string;
    profile: {
      displayName: string;
      url: string;
      avatar?: { id: string; uri: string };
    };
  };
}
