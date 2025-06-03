import {
  CalloutState,
  CalloutType,
  CreateCalloutInput,
  CreateProfileInput,
  CreateReferenceInput,
  CreateTemplateFromSpaceMutationVariables,
  CreateWhiteboardInput,
  UpdateCalloutMutationVariables,
  UpdateCommunityGuidelinesMutationVariables,
  UpdateProfileInput,
  UpdateTagsetInput,
  UpdateTemplateFromSpaceMutationVariables,
  VisualType,
} from '@/core/apollo/generated/graphql-schema';
import {
  CreateTemplateMutationVariables,
  TemplateType,
  UpdateTemplateMutationVariables,
} from '@/core/apollo/generated/graphql-schema';
import { AnyTemplateFormSubmittedValues } from '../TemplateForm';
import { TemplateContentCommunityGuidelinesFormSubmittedValues } from '../TemplateContentCommunityGuidelinesForm';
import { TemplateContentWhiteboardFormSubmittedValues } from '../TemplateContentWhiteboardForm';
import { TemplateContentCalloutFormSubmittedValues } from '../TemplateContentCalloutForm';
import { TemplateContentSpaceFormSubmittedValues as SpaceContentTemplateFormSubmittedValues } from '../../../contentSpace/TemplateContentSpaceForm';
import { TemplateContentPostFormSubmittedValues } from '../TemplateContentPostForm';
import { AnyTemplate } from '@/domain/templates/models/TemplateBase';
import { CommunityGuidelinesTemplate } from '@/domain/templates/models/CommunityGuidelinesTemplate';
import { CalloutTemplate } from '@/domain/templates/models/CalloutTemplate';
import { SpaceTemplateModel } from '@/domain/templates/models/SpaceTemplate';

interface EntityWithProfile {
  profile: {
    displayName?: string;
    description?: string;
    tagline?: string;
    references?: {
      name?: string;
      uri?: string;
      description?: string;
    }[];
    tagsets?: {
      tags: string[];
    }[];
  };
}

interface ProfileWithTags {
  profile: {
    tagsets?: {
      ID?: string;
      tags: string[];
    }[];
    defaultTagset?: {
      tags: string[];
    };
  };
}

interface ProfileWithReferences {
  profile: {
    references?: {
      ID?: string;
      name?: string;
      uri?: string;
      description?: string;
    }[];
  };
}

const handleCreateProfile = (
  data: EntityWithProfile | undefined
): { profileData: CreateProfileInput; tags: string[] | undefined } => {
  if (!data) {
    throw new Error('No profile data provided');
  }
  return {
    profileData: {
      displayName: data.profile.displayName ?? '',
      description: data.profile.description,
      tagline: data.profile.tagline,
      referencesData: handleCreateReferences(data),
    },
    tags: handleCreateTags(data),
  };
};

const handleCreateReferences = (data: ProfileWithReferences): CreateReferenceInput[] | undefined => {
  return data.profile.references?.map((reference, index) => ({
    name: reference.name ?? `Reference ${index + 1}`,
    description: reference.description,
    uri: reference.uri,
  }));
};

const handleCreateTags = (data: ProfileWithTags): string[] | undefined => {
  if (data.profile.defaultTagset) {
    return data.profile.defaultTagset.tags;
  }
  const tags = data.profile.tagsets?.[0]?.tags ?? [];
  if (tags.length > 0) {
    return tags;
  }
};

const handleCreateWhiteboard = (data?: {
  content?: string;
  profile?: {
    displayName?: string;
    preview?: {
      name: VisualType.Banner;
      uri: string;
    };
  };
}): CreateWhiteboardInput | undefined => {
  if (!data) {
    return undefined;
  }
  return {
    content: data.content,
    profile: {
      displayName: data.profile?.displayName ? data.profile?.displayName : 'Whiteboard Template',
      visuals: data.profile?.preview
        ? [
            {
              name: VisualType.Banner,
              uri: data.profile.preview.uri,
            },
          ]
        : undefined,
    },
  };
};

// Preview images are handled and uploaded in WhiteboardPreviewImages
// But we need to tell the server that we want it to include the visuals ids in the response to the mutation
// so we can upload the previews to those visuals
const shouldRequestPreviewVisuals = (
  data: AnyTemplateFormSubmittedValues
): { includeProfileVisuals?: boolean } | undefined => {
  if (data && (data as TemplateContentWhiteboardFormSubmittedValues).whiteboardPreviewImages) {
    return { includeProfileVisuals: true };
  }
  return undefined;
};

const handleContributionDefaults = (
  data:
    | {
        postDescription?: string;
        whiteboardContent?: string;
      }
    | undefined
) => {
  if (data) {
    return {
      postDescription: data.postDescription,
      whiteboardContent: data.whiteboardContent,
    };
  }
};

export const toCreateTemplateMutationVariables = (
  templatesSetId: string,
  templateType: TemplateType,
  values: AnyTemplateFormSubmittedValues
): CreateTemplateMutationVariables => {
  const result: CreateTemplateMutationVariables = {
    templatesSetId,
    type: templateType,
    ...handleCreateProfile(values),
    ...shouldRequestPreviewVisuals(values),
  };

  switch (templateType) {
    case TemplateType.Callout: {
      const calloutTemplateData = values as TemplateContentCalloutFormSubmittedValues;
      if (!calloutTemplateData.callout || !calloutTemplateData.callout.type) {
        throw new Error('Callout template must have callout data');
      }
      const { profileData, tags } = handleCreateProfile(calloutTemplateData.callout.framing);
      const callout: CreateCalloutInput = {
        type: calloutTemplateData.callout.type,
        framing: {
          profile: profileData,
          tags,
          whiteboard: handleCreateWhiteboard(calloutTemplateData.callout.framing.whiteboard),
        },
      };
      callout.contributionDefaults = handleContributionDefaults(calloutTemplateData.callout.contributionDefaults);

      switch (calloutTemplateData.callout?.type) {
        case CalloutType.Post:
        case CalloutType.PostCollection: {
          delete callout.contributionDefaults?.whiteboardContent;
          delete callout.framing.whiteboard;
          break;
        }
        case CalloutType.LinkCollection: {
          delete callout.contributionDefaults;
          delete callout.framing.whiteboard;
          break;
        }
        case CalloutType.Whiteboard: {
          delete callout.contributionDefaults;
          // if there are preview images for upload, do not use the existing preview
          if (calloutTemplateData.whiteboardPreviewImages) {
            delete callout.framing.whiteboard?.profile?.visuals;
          }
          break;
        }
        case CalloutType.WhiteboardCollection: {
          delete callout.framing.whiteboard;
          delete callout.contributionDefaults?.postDescription;
          break;
        }
      }
      callout.contributionPolicy = { state: CalloutState.Open };
      result.calloutData = callout;
      break;
    }
    case TemplateType.Space: {
      // TODO: Nothing to do here, for now we cannot create CollaborationTemplates with data inside, we can only copy another collaboration
      throw new Error('Call toCreateTemplateFromCollaborationMutationVariables instead');
    }
    case TemplateType.CommunityGuidelines: {
      const communityGuidelinesTemplateData = values as TemplateContentCommunityGuidelinesFormSubmittedValues;
      const { profileData } = handleCreateProfile(communityGuidelinesTemplateData.communityGuidelines);
      result.communityGuidelinesData = {
        profile: profileData,
        // Community Guidelines don't have tags
      };
      break;
    }
    case TemplateType.Post: {
      const postData = values as TemplateContentPostFormSubmittedValues;
      result.postDefaultDescription = postData.postDefaultDescription;
      break;
    }
    case TemplateType.Whiteboard: {
      const whiteboardTemplateData = values as TemplateContentWhiteboardFormSubmittedValues;
      result.whiteboard = handleCreateWhiteboard(whiteboardTemplateData.whiteboard);
      break;
    }
  }

  return result;
};

export const toCreateTemplateFromSpaceContentMutationVariables = (
  templatesSetId: string,
  values: SpaceContentTemplateFormSubmittedValues
): CreateTemplateFromSpaceMutationVariables => {
  // TODO: Maybe in the future we don't receive collaborationId to copy the collaboration and we receive the collaboration data directly
  if (!values.contentSpaceId) {
    throw new Error('Collaboration ID is required to create a template from a collaboration');
  }

  return {
    spaceId: values.contentSpaceId,
    templatesSetId: templatesSetId,
    profileData: {
      displayName: values.profile.displayName ?? '',
      description: values.profile.description,
      referencesData: values.profile.references?.map((ref, i) => ({
        name: ref.name ?? `Reference ${i}`,
        uri: ref.uri,
        description: ref.description,
      })),
    },
    tags: handleCreateTags(values),
  };
};

interface TemplateTagset {
  id?: string;
  ID?: string;
  name?: string;
  tags?: string[];
}

export const mapTagsetsToUpdateTagsets = (
  profile:
    | {
        defaultTagset?: TemplateTagset;
        tagsets?: TemplateTagset[];
      }
    | undefined
): UpdateTagsetInput[] | undefined => {
  if (profile?.defaultTagset) {
    return [
      {
        ID: profile.defaultTagset.id ?? profile.defaultTagset.ID ?? '',
        tags: profile.defaultTagset.tags ?? [],
      },
    ];
  } else if (profile?.tagsets && profile.tagsets.length > 0) {
    return profile.tagsets
      .filter(tagset => tagset.id || tagset.ID) // remove all tagsets that don't have an ID
      .map(tagset => ({
        ID: tagset.id ?? tagset.ID!, // ensured by the filter
        name: tagset.name,
        tags: tagset.tags ?? [],
      }));
  }
  return undefined;
};

interface TemplateProfile {
  displayName?: string;
  description?: string;
  tagline?: string;
  defaultTagset?: TemplateTagset;
}

export const mapTemplateProfileToUpdateProfileInput = (profile?: TemplateProfile): UpdateProfileInput => {
  return {
    displayName: profile?.displayName,
    description: profile?.description,
    tagline: profile?.tagline,
    tagsets: mapTagsetsToUpdateTagsets(profile),
  };
};

// For updating a template we update the Template itself and the elements inside it separately
export const toUpdateTemplateMutationVariables = (
  templateId: string,
  template: AnyTemplate,
  newValues: AnyTemplateFormSubmittedValues
): {
  updateTemplateVariables: UpdateTemplateMutationVariables;
  updateCalloutVariables?: UpdateCalloutMutationVariables;
  updateCommunityGuidelinesVariables?: UpdateCommunityGuidelinesMutationVariables;
  updateSpaceTemplateVariables?: UpdateTemplateFromSpaceMutationVariables;
} => {
  const updateTemplateVariables: UpdateTemplateMutationVariables = {
    templateId: templateId!,
    profile: mapTemplateProfileToUpdateProfileInput(newValues.profile),
    ...shouldRequestPreviewVisuals(newValues),
  };
  switch (template.type) {
    case TemplateType.Callout: {
      const calloutTemplateData = newValues as TemplateContentCalloutFormSubmittedValues;
      const updateCalloutVariables: UpdateCalloutMutationVariables = {
        calloutData: {
          ID: (template as CalloutTemplate).callout?.id!,
          framing: {
            profile: mapTemplateProfileToUpdateProfileInput(calloutTemplateData.callout?.framing.profile),
            whiteboardContent: calloutTemplateData.callout?.framing.whiteboard?.content,
          },
          contributionDefaults: handleContributionDefaults(calloutTemplateData.callout?.contributionDefaults),
        },
      };
      // Delete useless fields and leave only the fields relevant to the callout types
      switch ((template as CalloutTemplate).callout?.type) {
        case CalloutType.Post: {
          delete updateCalloutVariables.calloutData?.contributionDefaults;
          delete updateCalloutVariables.calloutData?.framing?.whiteboardContent;
          break;
        }
        case CalloutType.PostCollection: {
          delete updateCalloutVariables.calloutData?.framing?.whiteboardContent;
          delete updateCalloutVariables.calloutData?.contributionDefaults?.whiteboardContent;
          break;
        }
        case CalloutType.LinkCollection: {
          delete updateCalloutVariables.calloutData?.framing?.whiteboardContent;
          delete updateCalloutVariables.calloutData?.contributionDefaults;
          break;
        }
        case CalloutType.Whiteboard: {
          delete updateCalloutVariables.calloutData?.contributionDefaults;
          break;
        }
        case CalloutType.WhiteboardCollection: {
          delete updateCalloutVariables.calloutData?.framing?.whiteboardContent;
          delete updateCalloutVariables.calloutData?.contributionDefaults?.postDescription;
          break;
        }
      }

      return {
        updateTemplateVariables,
        updateCalloutVariables,
      };
    }
    case TemplateType.Space: {
      // Special case: In CollaborationTemplates we update the collaborationId in the formik values to
      // mark that this template should load its content from another collaboration.
      // Then updateCollaborationTemplateVariables will be returned and the mutation will be called.
      // If the collaborationId remains the same, we just update the template profile.
      const oldCollaborationId = (template as SpaceTemplateModel).contentSpace?.collaboration?.id;
      const newCollaborationId = (newValues as SpaceContentTemplateFormSubmittedValues).contentSpaceId;
      if (oldCollaborationId && newCollaborationId && oldCollaborationId !== newCollaborationId) {
        const updateSpaceContentTemplateVariables: UpdateTemplateFromSpaceMutationVariables = {
          templateId,
          spaceId: newCollaborationId, // TODO: FIX THIS!
        };
        return {
          updateTemplateVariables,
          updateSpaceTemplateVariables: updateSpaceContentTemplateVariables,
        };
      } else {
        // Collaboration selected didn't change, just update the template values
        return {
          updateTemplateVariables,
        };
      }
    }
    case TemplateType.CommunityGuidelines: {
      const communityGuidelinesTemplateData = newValues as TemplateContentCommunityGuidelinesFormSubmittedValues;
      const updateCommunityGuidelinesVariables: UpdateCommunityGuidelinesMutationVariables = {
        communityGuidelinesData: {
          communityGuidelinesID: (template as CommunityGuidelinesTemplate).communityGuidelines?.id!,
          profile: mapTemplateProfileToUpdateProfileInput(communityGuidelinesTemplateData.communityGuidelines?.profile),
        },
      };
      return {
        updateTemplateVariables,
        updateCommunityGuidelinesVariables,
      };
    }
    case TemplateType.Post: {
      updateTemplateVariables.postDefaultDescription = (
        newValues as TemplateContentPostFormSubmittedValues
      ).postDefaultDescription;
      return {
        updateTemplateVariables,
      };
    }
    case TemplateType.Whiteboard: {
      updateTemplateVariables.whiteboardContent = (
        newValues as TemplateContentWhiteboardFormSubmittedValues
      ).whiteboard?.content;
      return {
        updateTemplateVariables,
      };
    }
  }
  throw new Error('Coulndt identify callout type');
};
