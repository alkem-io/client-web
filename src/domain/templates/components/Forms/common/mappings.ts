import produce from 'immer';
import {
  CalloutState,
  CalloutType,
  CreateCalloutInput,
  CreateCommunityGuidelinesInput,
  CreateInnovationFlowData,
  CreateReferenceInput,
  CreateWhiteboardInput,
  UpdateProfileInput,
  UpdateReferenceInput,
  UpdateTagsetInput,
} from '../../../../../core/apollo/generated/graphql-schema';
import {
  CreateTemplateMutationVariables,
  TemplateType,
  UpdateTemplateMutationVariables,
} from '../../../../../core/apollo/generated/graphql-schema';
import { AnyTemplateFormSubmittedValues } from '../TemplateForm';
import { CommunityGuidelinesTemplateFormSubmittedValues } from '../CommunityGuidelinesTemplateForm';
import { WritableDraft } from 'immer/dist/internal';
import { InnovationFlowTemplateFormSubmittedValues } from '../InnovationFlowTemplateForm';
import { WhiteboardTemplateFormSubmittedValues } from '../WhiteboardTemplateForm';
import { CalloutTemplateFormSubmittedValues } from '../CalloutTemplateForm';
import { PostTemplateFormSubmittedValues } from '../PostTemplateForm';
import { findDefaultTagset } from '../../../../common/tags/utils';

interface TemplateTagset {
  id?: string;
  ID?: string;
  name?: string;
  tags?: string[];
}

export const mapTagsetsToUpdateTagsets = (tagsets: TemplateTagset[] | undefined): UpdateTagsetInput[] => {
  return (
    tagsets?.map(tagset => ({
      ID: tagset.id ?? '',
      tags: tagset.tags ?? [],
    })) ?? [{ ID: '', tags: [] }]
  );
};

const mapTagsetsToCreateTagsets = (tagsets: TemplateTagset[] | undefined): string[] | undefined => {
  const defaultTagset = findDefaultTagset(tagsets);
  return defaultTagset?.tags;
};

interface TemplateReference {
  id?: string;
  ID?: string;
  name?: string;
  uri?: string;
  description?: string;
}

export const mapReferencesToUpdateReferences = (
  references: TemplateReference[] | undefined
): UpdateReferenceInput[] | undefined => {
  return references?.map(reference => ({
    ID: reference.id ?? reference.ID ?? '',
    description: reference.description,
    uri: reference.uri,
    name: reference.name,
  }));
};

const mapReferencesToCreateReferences = (
  references: TemplateReference[] | undefined
): CreateReferenceInput[] | undefined => {
  return references?.map(reference => ({
    name: reference.name ?? '',
    description: reference.description ?? '',
    uri: reference.uri,
  }));
};

interface TemplateProfile {
  displayName: string;
  description?: string;
  defaultTagset?: TemplateTagset;
}

export const mapTemplateProfileToUpdateProfile = (profile?: TemplateProfile): UpdateProfileInput => {
  return {
    displayName: profile?.displayName ?? '',
    description: profile?.description ?? '',
    tagsets: profile?.defaultTagset
      ? mapTagsetsToUpdateTagsets([profile.defaultTagset])
      : mapTagsetsToUpdateTagsets(undefined),
  };
};

// Always remove the preview images from the Create/Update calls, visuals are handled separately
const handlePreviewImages = draft => {
  if (draft.whiteboardPreviewImages) {
    delete draft.whiteboardPreviewImages;
    draft['includeProfileVisuals'] = true; // Will tell the mutation to retrieve the visuals after creation/update to upload the preview images of f.e. whiteboards
  }
};

export const toCreateTemplateMutationVariables = (
  templatesSetId: string,
  templateType: TemplateType,
  values: AnyTemplateFormSubmittedValues
): CreateTemplateMutationVariables => {
  const result: CreateTemplateMutationVariables = {
    templatesSetId: templatesSetId,
    type: templateType,
    profileData: {
      displayName: values.profile.displayName ?? '',
      description: values.profile.description,
      referencesData: mapReferencesToCreateReferences(values.profile.references),
    },
    tags: mapTagsetsToCreateTagsets(values.profile.tagsets),
  };

  switch (templateType) {
    case TemplateType.Callout: {
      const calloutTemplate = values as CalloutTemplateFormSubmittedValues;
      const calloutData: CreateCalloutInput = {
        framing: {
          profile: {
            displayName: calloutTemplate.callout?.framing.profile.displayName ?? '',
            description: calloutTemplate.callout?.framing.profile.description,
          },
          tags: mapTagsetsToCreateTagsets(calloutTemplate.callout?.framing.profile.tagsets),
          whiteboard:
            calloutTemplate.callout?.framing.whiteboard && calloutTemplate.callout?.type === CalloutType.Whiteboard
              ? {
                  profileData: {
                    displayName: 'Callout Template - Whiteboard',
                  },
                  content: calloutTemplate.callout?.framing.whiteboard.content,
                }
              : undefined,
        },
        type: calloutTemplate.callout?.type ?? CalloutType.Post,
        contributionDefaults: {
          postDescription:
            calloutTemplate.callout?.type === CalloutType.PostCollection
              ? calloutTemplate.callout?.contributionDefaults?.postDescription
              : undefined,
          whiteboardContent:
            calloutTemplate.callout?.type === CalloutType.WhiteboardCollection
              ? calloutTemplate.callout?.contributionDefaults?.whiteboardContent
              : undefined,
        },
        contributionPolicy: {
          state: CalloutState.Open,
        },
        enableComments: false,
      };
      result.calloutData = calloutData;
      break;
    }
    case TemplateType.CommunityGuidelines: {
      const communityGuidelinesData: CreateCommunityGuidelinesInput = {
        profile: {
          displayName:
            (values as CommunityGuidelinesTemplateFormSubmittedValues).communityGuidelines?.profile.displayName ?? '',
          description: (values as CommunityGuidelinesTemplateFormSubmittedValues).communityGuidelines?.profile
            .description,
          referencesData: mapReferencesToCreateReferences(
            (values as CommunityGuidelinesTemplateFormSubmittedValues).communityGuidelines?.profile.references
          ),
        },
      };
      result.communityGuidelinesData = communityGuidelinesData;
      break;
    }
    case TemplateType.InnovationFlow: {
      const innovationFlowData: CreateInnovationFlowData = {
        profile: {
          displayName: 'Innovation Flow Template',
        },
        states: (values as InnovationFlowTemplateFormSubmittedValues).innovationFlow.states,
      };
      result.innovationFlowData = innovationFlowData;
      break;
    }
    case TemplateType.Post: {
      result.postDefaultDescription = (values as PostTemplateFormSubmittedValues).postDefaultDescription;
      break;
    }
    case TemplateType.Whiteboard: {
      const whiteboardData: CreateWhiteboardInput = {
        profileData: {
          displayName: 'Whiteboard Template',
        },
        content: (values as WhiteboardTemplateFormSubmittedValues).whiteboard?.content,
      };
      result.whiteboard = whiteboardData;
      break;
    }
  }

  return result;
};

/* ==========================
 * UPDATE TEMPLATES MUTATIONS
 * ==========================
 */

const mapReferences = (ref: { id?: string; ID?: string; name?: string; uri?: string; description?: string }) => ({
  ID: ref.ID ?? ref.id ?? '', // We have some cases where id is lowercase, see ProfileReferenceSegment
  name: ref.name,
  uri: ref.uri,
  description: ref.description,
});

export const toUpdateTemplateMutationVariables = (
  templateId: string,
  values: AnyTemplateFormSubmittedValues
): UpdateTemplateMutationVariables => {
  let newValues = produce(values, draft => {
    handlePreviewImages(draft);
    if (draft.profile.references) {
      draft.profile.references = draft.profile.references.map(mapReferences);
    }
    if (draft['communityGuidelines']) {
      const communityGuidelinesDraft = draft as WritableDraft<CommunityGuidelinesTemplateFormSubmittedValues>;
      if (communityGuidelinesDraft.communityGuidelines?.profile.references) {
        communityGuidelinesDraft.communityGuidelines.profile.references =
          communityGuidelinesDraft.communityGuidelines.profile.references.map(mapReferences);
      }
    }
    if (draft['callout']) {
      const calloutDraft = draft as WritableDraft<CalloutTemplateFormSubmittedValues>;
      // Delete useless fields and leave only the fields relevant to the callout types
      switch (calloutDraft.callout?.type) {
        case CalloutType.Post: {
          delete calloutDraft.callout?.contributionDefaults;
          delete calloutDraft.callout?.framing.whiteboard;
          break;
        }
        case CalloutType.PostCollection: {
          delete calloutDraft.callout?.framing.whiteboard;
          delete calloutDraft.callout?.contributionDefaults?.whiteboardContent;
          break;
        }
        case CalloutType.LinkCollection: {
          delete calloutDraft.callout?.framing.whiteboard;
          delete calloutDraft.callout?.contributionDefaults;
          break;
        }
        case CalloutType.Whiteboard: {
          delete calloutDraft.callout?.contributionDefaults;
          break;
        }
        case CalloutType.WhiteboardCollection: {
          delete calloutDraft.callout?.framing.whiteboard;
          delete calloutDraft.callout?.contributionDefaults?.postDescription;
          break;
        }
      }

      delete calloutDraft.callout?.type; // Never send Callout type as it cannot be changed
    }
  });

  return {
    templateId: templateId!,
    ...newValues,
  };
};
