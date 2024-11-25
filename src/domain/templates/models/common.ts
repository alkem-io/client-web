import { CalloutType, TemplateType } from '@/core/apollo/generated/graphql-schema';
import { CalloutTemplate } from './CalloutTemplate';
import { CommunityGuidelinesTemplate } from './CommunityGuidelinesTemplate';
import { AnyTemplate, TemplateBase } from './TemplateBase';
import { PostTemplate } from './PostTemplate';
import { WhiteboardTemplate } from './WhiteboardTemplate';
import EmptyWhiteboard from '@/domain/common/whiteboard/EmptyWhiteboard';
import { CollaborationTemplate } from './CollaborationTemplate';
import { findDefaultTagset } from '@/domain/common/tags/utils';

export const getNewTemplate = (
  templateType: TemplateType,
  defaultValues?: Partial<AnyTemplate>
): AnyTemplate | undefined => {
  const common: TemplateBase = {
    id: '',
    type: templateType,
    profile: {
      displayName: '',
      description: '',
      defaultTagset: {
        tags: [],
      },
    },
  };

  switch (templateType) {
    case TemplateType.Callout: {
      const data = defaultValues as Partial<CalloutTemplate>;
      const defaultTagset = findDefaultTagset(data?.callout?.framing.profile?.tagsets);
      const template: CalloutTemplate = {
        ...common,
        type: TemplateType.Callout,
        callout: {
          id: '',
          type: data?.callout?.type ?? CalloutType.Post,
          framing: {
            profile: {
              displayName: data?.callout?.framing.profile?.displayName ?? '',
              description: data?.callout?.framing.profile?.description ?? '',
              references: data?.callout?.framing.profile?.references ?? [],
              tagsets: defaultTagset ? [defaultTagset] : [],
            },
            whiteboard: data?.callout?.framing.whiteboard ?? undefined,
          },
          contributionDefaults: {
            postDescription: data?.callout?.contributionDefaults?.postDescription ?? '',
            whiteboardContent:
              data?.callout?.contributionDefaults?.whiteboardContent ?? JSON.stringify(EmptyWhiteboard),
          },
        },
      };
      return template;
    }
    case TemplateType.Collaboration: {
      const data = defaultValues as Partial<CollaborationTemplate>;
      const template: CollaborationTemplate = {
        ...common,
        type: TemplateType.Collaboration,
        collaboration: data?.collaboration,
      };
      return template;
    }
    case TemplateType.CommunityGuidelines: {
      const data = defaultValues as Partial<CommunityGuidelinesTemplate>;
      const template: CommunityGuidelinesTemplate = {
        ...common,
        type: TemplateType.CommunityGuidelines,
        communityGuidelines: {
          id: '',
          profile: {
            displayName: data?.communityGuidelines?.profile?.displayName ?? '',
            description: data?.communityGuidelines?.profile?.description ?? '',
            references: data?.communityGuidelines?.profile?.references ?? [],
          },
        },
      };
      return template;
    }
    case TemplateType.Post: {
      const data = defaultValues as Partial<PostTemplate>;
      const template: PostTemplate = {
        ...common,
        type: TemplateType.Post,
        postDefaultDescription: data?.postDefaultDescription ?? '',
      };
      return template;
    }
    case TemplateType.Whiteboard: {
      const data = defaultValues as Partial<WhiteboardTemplate>;
      const template: WhiteboardTemplate = {
        ...common,
        type: TemplateType.Whiteboard,
        whiteboard: {
          id: '',
          content: data?.whiteboard?.content ?? '',
        },
      };
      return template;
    }
  }
};
