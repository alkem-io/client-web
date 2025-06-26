import { CalloutFramingType, TemplateType } from '@/core/apollo/generated/graphql-schema';
import { CalloutTemplate } from './CalloutTemplate';
import { CommunityGuidelinesTemplate } from './CommunityGuidelinesTemplate';
import { AnyTemplate, TemplateBase } from './TemplateBase';
import { PostTemplate } from './PostTemplate';
import { WhiteboardTemplate } from './WhiteboardTemplate';
import EmptyWhiteboard from '@/domain/common/whiteboard/EmptyWhiteboard';
import { SpaceTemplate } from './SpaceTemplate';
import { findDefaultTagset } from '@/domain/common/tagset/TagsetUtils';

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
          framing: {
            profile: {
              displayName: data?.callout?.framing.profile?.displayName ?? '',
              description: data?.callout?.framing.profile?.description ?? '',
              references: data?.callout?.framing.profile?.references ?? [],
              tagsets: defaultTagset ? [defaultTagset] : [],
            },
            type: data?.callout?.framing.type ?? CalloutFramingType.None,
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
    case TemplateType.Space: {
      const data = defaultValues as Partial<SpaceTemplate>;
      const template: SpaceTemplate = {
        ...common,
        type: TemplateType.Space,
        spaceId: data?.spaceId, // used for creation, it's the spaceId that will be copied to a template
        contentSpace: data?.contentSpace, // This is the content of the template, used for preview and updating the template
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
