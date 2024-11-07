import {
  CalloutState,
  CalloutType,
  CreateCalloutInput,
  CreateProfileInput,
  CreateReferenceInput,
  CreateTemplateFromCollaborationMutationVariables,
  CreateWhiteboardInput,
  UpdateCalloutMutationVariables,
  UpdateCommunityGuidelinesMutationVariables,
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
import { WhiteboardTemplateFormSubmittedValues } from '../WhiteboardTemplateForm';
import { CalloutTemplateFormSubmittedValues } from '../CalloutTemplateForm';
import { CollaborationTemplateFormSubmittedValues } from '../CollaborationTemplateForm';
import { PostTemplateFormSubmittedValues } from '../PostTemplateForm';
import { AnyTemplate } from '../../../models/TemplateBase';
import { CommunityGuidelinesTemplate } from '../../../models/CommunityGuidelinesTemplate';
import { CalloutTemplate } from '../../../models/CalloutTemplate';

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
  };
}): CreateWhiteboardInput | undefined => {
  if (!data) {
    return undefined;
  }
  return {
    content: data.content,
    profileData: {
      displayName: data.profile?.displayName ? data.profile?.displayName : 'Whiteboard Template',
    },
  };
};

const handlePreviewImages = (data: AnyTemplateFormSubmittedValues): { includeProfileVisuals?: boolean } | undefined => {
  // We don't do anything from here, preview images are handled and uploaded in WhiteboardPreviewImages
  // But we need to tell the server that we want it to include the visuals so we can upload the previews to those visuals
  if (data && (data as WhiteboardTemplateFormSubmittedValues).whiteboardPreviewImages) {
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
    ...handlePreviewImages(values),
  };

  switch (templateType) {
    case TemplateType.Callout: {
      const calloutTemplateData = values as CalloutTemplateFormSubmittedValues;
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
          break;
        }
        case CalloutType.WhiteboardCollection: {
          delete calloutTemplateData.callout.framing.whiteboard;
          delete calloutTemplateData.callout.contributionDefaults?.postDescription;
          break;
        }
      }
      callout.contributionPolicy = { state: CalloutState.Open };
      result.calloutData = callout;
      break;
    }
    case TemplateType.Collaboration: {
      // TODO: Nothing to do here, for now we cannot create CollaborationTemplates with data inside, we can only copy another collaboration
      throw new Error('Call toCreateTemplateFromCollaborationMutationVariables instead');
    }
    case TemplateType.CommunityGuidelines: {
      const communityGuidelinesTemplateData = values as CommunityGuidelinesTemplateFormSubmittedValues;
      const { profileData } = handleCreateProfile(communityGuidelinesTemplateData.communityGuidelines);
      result.communityGuidelinesData = {
        profile: profileData,
        // Community Guidelines don't have tags
      };
      break;
    }
    case TemplateType.Post: {
      const postData = values as PostTemplateFormSubmittedValues;
      result.postDefaultDescription = postData.postDefaultDescription;
      break;
    }
    case TemplateType.Whiteboard: {
      const whiteboardTemplateData = values as WhiteboardTemplateFormSubmittedValues;
      result.whiteboard = handleCreateWhiteboard(whiteboardTemplateData.whiteboard);
      break;
    }
  }

  return result;
};

export const toCreateTemplateFromCollaborationMutationVariables = (
  templatesSetId: string,
  values: CollaborationTemplateFormSubmittedValues
): CreateTemplateFromCollaborationMutationVariables => {
  // TODO: Maybe in the future we don't receive collaborationId to copy the collaboration and we receive the collaboration data directly
  if (!values.collaborationId) {
    throw new Error('Collaboration ID is required to create a template from a collaboration');
  }

  const result: CreateTemplateFromCollaborationMutationVariables = {
    collaborationId: values.collaborationId,
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
    tags: values.profile.tagsets?.[0]?.tags ?? [],
  };
  return result;
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
  if (profile?.defaultTagset && (profile?.defaultTagset.id || profile?.defaultTagset.ID)) {
    return [
      {
        ID: profile.defaultTagset.id ?? profile.defaultTagset.ID!, // ensured by the previous if
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

interface TemplateReference {
  ID?: string; // TODO: We have some cases where id is lowercase, see ProfileReferenceSegment
  id?: string;
  name?: string;
  uri?: string;
  description?: string;
}

export const mapReferencesToUpdateReferences = (
  references: TemplateReference[] | undefined
): UpdateReferenceInput[] | undefined => {
  return references?.map(reference => ({
    ID: reference.ID ?? reference.id ?? '',
    description: reference.description,
    uri: reference.uri,
    name: reference.name,
  }));
};

interface TemplateProfile {
  displayName?: string;
  description?: string;
  tagline?: string;
  defaultTagset?: TemplateTagset;
}

export const mapTemplateProfileToUpdateProfile = (profile?: TemplateProfile): UpdateProfileInput => {
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
} => {
  const updateTemplateVariables: UpdateTemplateMutationVariables = {
    templateId: templateId!,
    profile: mapTemplateProfileToUpdateProfile(newValues.profile),
    ...handlePreviewImages(newValues),
  };
  switch (template.type) {
    case TemplateType.Callout: {
      const calloutTemplateData = newValues as CalloutTemplateFormSubmittedValues;
      const updateCalloutVariables: UpdateCalloutMutationVariables = {
        calloutData: {
          ID: (template as CalloutTemplate).callout?.id!,
          framing: {
            profile: mapTemplateProfileToUpdateProfile(calloutTemplateData.callout?.framing.profile),
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
    case TemplateType.Collaboration: {
      // TODO: Cannot update Collaboration Template content yet, but we can update the profile of it
      return {
        updateTemplateVariables,
      };
    }
    case TemplateType.CommunityGuidelines: {
      const communityGuidelinesTemplateData = newValues as CommunityGuidelinesTemplateFormSubmittedValues;
      const updateCommunityGuidelinesVariables: UpdateCommunityGuidelinesMutationVariables = {
        communityGuidelinesData: {
          communityGuidelinesID: (template as CommunityGuidelinesTemplate).communityGuidelines?.id!,
          profile: mapTemplateProfileToUpdateProfile(communityGuidelinesTemplateData.communityGuidelines?.profile),
        },
      };
      return {
        updateTemplateVariables,
        updateCommunityGuidelinesVariables,
      };
    }
    case TemplateType.Post: {
      updateTemplateVariables.postDefaultDescription = (
        newValues as PostTemplateFormSubmittedValues
      ).postDefaultDescription;
      return {
        updateTemplateVariables,
      };
    }
    case TemplateType.Whiteboard: {
      updateTemplateVariables.whiteboardContent = (
        newValues as WhiteboardTemplateFormSubmittedValues
      ).whiteboard?.content;
      return {
        updateTemplateVariables,
      };
    }
  }
  throw new Error('Coulndt identify callout type');
};
