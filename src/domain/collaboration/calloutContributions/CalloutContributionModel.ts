import type { AuthorizationPrivilege, CollaboraDocumentType } from '@/core/apollo/generated/graphql-schema';
import type { Identifiable } from '@/core/utils/Identifiable';
import type { ReferenceModel } from '@/domain/common/reference/ReferenceModel';

type CalloutContributionModel = Identifiable & {
  authorization?: {
    myPrivileges?: AuthorizationPrivilege[];
  };
  post?: {
    id: string;
    profile: {
      displayName: string;
      description?: string;
      tagset?: {
        tags: string[];
      };
      references?: ReferenceModel[];
      url: string;
    };
    comments: {
      id: string;
      messagesCount: number;
    };
  };
  whiteboard?: {
    id: string;
    profile: {
      preview?: { uri: string };
    };
  };
  memo?: {
    id: string;
    profile: {
      displayName: string;
      url: string;
    };
    markdown?: string;
  };
  collaboraDocument?: {
    id: string;
    documentType: CollaboraDocumentType;
    profile?: {
      displayName: string;
      url: string;
    };
    createdDate?: Date | string;
    createdBy?: {
      id: string;
      profile?: { displayName: string };
    };
  };
};

export default CalloutContributionModel;
