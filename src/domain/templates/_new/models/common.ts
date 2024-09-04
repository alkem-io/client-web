import { CalloutType, TemplateType } from '../../../../core/apollo/generated/graphql-schema';
import { CalloutTemplate } from './CalloutTemplate';
import { CommunityGuidelinesTemplate } from './CommunityGuidelinesTemplate';
import { InnovationFlowTemplate } from './InnovationFlowTemplate';
import { AnyTemplate, NewTemplateBase } from './TemplateBase';
import { PostTemplate } from './PostTemplate';
import { WhiteboardTemplate } from './WhiteboardTemplate';
import EmptyWhiteboard from '../../../common/whiteboard/EmptyWhiteboard';

export const getNewTemplate = (templateType: TemplateType): AnyTemplate => {
  const common: NewTemplateBase = {
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
      const template: CalloutTemplate = {
        ...common,
        type: TemplateType.Callout,
        callout: {
          id: '',
          type: CalloutType.Post,
          framing: {
            profile: {
              displayName: '',
              description: '',
              references: [],
              tagsets: [],
            },
            whiteboard: undefined,
          },
          contributionDefaults: {
            postDescription: '',
            whiteboardContent: JSON.stringify(EmptyWhiteboard),
          },
        },
      };
      return template;
    }
    case TemplateType.CommunityGuidelines: {
      const template: CommunityGuidelinesTemplate = {
        ...common,
        type: TemplateType.CommunityGuidelines,
        communityGuidelines: {
          id: '',
          profile: {
            displayName: '',
            description: '',
            references: [],
          },
        },
      };
      return template;
    }
    case TemplateType.InnovationFlow: {
      const template: InnovationFlowTemplate = {
        ...common,
        type: TemplateType.InnovationFlow,
        innovationFlow: {
          id: '',
          states: [],
        },
      };
      return template;
    }
    case TemplateType.Post: {
      const template: PostTemplate = {
        ...common,
        type: TemplateType.Post,
        postDefaultDescription: '',
      };
      return template;
    }
    case TemplateType.Whiteboard: {
      const template: WhiteboardTemplate = {
        ...common,
        type: TemplateType.Whiteboard,
        whiteboard: {
          id: '',
        },
      };
      return template;
    }
  }
};
