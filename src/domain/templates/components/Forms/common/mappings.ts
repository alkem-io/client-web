import {
  CalloutFramingType,
  CreateCalloutInput,
  CreateProfileInput,
  CreateReferenceInput,
  CreateTemplateFromSpaceMutationVariables,
  CreateTemplateFromContentSpaceMutationVariables,
  CreateWhiteboardInput,
  UpdateCalloutTemplateMutationVariables,
  UpdateCommunityGuidelinesMutationVariables,
  UpdateProfileInput,
  UpdateTagsetInput,
  UpdateTemplateFromSpaceMutationVariables,
  VisualType,
  CalloutContributionType,
  CreateLinkInput,
  CreateMemoInput,
} from '@/core/apollo/generated/graphql-schema';
import {
  CreateTemplateMutationVariables,
  TemplateType,
  UpdateTemplateMutationVariables,
} from '@/core/apollo/generated/graphql-schema';
import { AnyTemplateFormSubmittedValues } from '../TemplateForm';
import { TemplateCommunityGuidelinesFormSubmittedValues } from '../TemplateCommunityGuidelinesForm';
import { TemplateWhiteboardFormSubmittedValues } from '../TemplateWhiteboardForm';
import { TemplateCalloutFormSubmittedValues } from '../TemplateCalloutForm';
import { TemplateSpaceFormSubmittedValues } from '../TemplateSpaceForm';
import { TemplatePostFormSubmittedValues } from '../TemplatePostForm';
import { AnyTemplate } from '@/domain/templates/models/TemplateBase';
import { CommunityGuidelinesTemplate } from '@/domain/templates/models/CommunityGuidelinesTemplate';
import { CalloutTemplate } from '@/domain/templates/models/CalloutTemplate';
import { SpaceTemplate } from '@/domain/templates/models/SpaceTemplate';
import {
  mapCalloutSettingsFormToCalloutSettingsModel,
  mapCalloutSettingsFormToCalloutUpdateSettings,
  mapLinkDataToUpdateLinkInput,
} from '@/domain/collaboration/callout/models/mappings';
import { mapReferenceModelsToUpdateReferenceInputs } from '@/domain/common/reference/ReferenceUtils';
import { ReferenceModel } from '@/domain/common/reference/ReferenceModel';
import { LinkDetails } from '@/domain/collaboration/calloutContributions/link/models/LinkDetails';

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

const mapLinkDataToCreateLinkInput = (linkData?: LinkDetails | undefined): CreateLinkInput | undefined => {
  if (!linkData) {
    return undefined;
  }

  return {
    uri: linkData.uri,
    profile: {
      displayName: linkData.profile?.displayName ?? '',
    },
  };
};

const mapMemoDataToCreateMemoInput = (memoData?: {
  markdown?: string;
  profile?: { displayName?: string };
}): CreateMemoInput | undefined => {
  if (!memoData) {
    return undefined;
  }

  return {
    markdown: memoData.markdown,
    profile: {
      displayName: memoData.profile?.displayName ?? 'Memo',
    },
  };
};

// Preview images are handled and uploaded in WhiteboardPreviewImages
// But we need to tell the server that we want it to include the visuals ids in the response to the mutation
// so we can upload the previews to those visuals
const shouldRequestPreviewVisuals = (
  data: AnyTemplateFormSubmittedValues
): { includeProfileVisuals?: boolean } | undefined => {
  if (data && (data as TemplateWhiteboardFormSubmittedValues).whiteboardPreviewImages) {
    return { includeProfileVisuals: true };
  }
  return undefined;
};

const handleContributionDefaults = (
  data:
    | {
        postDescription?: string;
        whiteboardContent?: string;
        defaultDisplayName?: string;
      }
    | undefined
) => {
  // Return the values only they are not empty, otherwise just set them to undefined
  if (data) {
    return {
      defaultDisplayName: data.defaultDisplayName ? data.defaultDisplayName : undefined,
      postDescription: data.postDescription ? data.postDescription : undefined,
      whiteboardContent: data.whiteboardContent ? data.whiteboardContent : undefined,
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
      const calloutTemplateData = values as TemplateCalloutFormSubmittedValues;
      if (!calloutTemplateData.callout) {
        throw new Error('Callout template must have callout data');
      }
      const { profileData, tags } = handleCreateProfile(calloutTemplateData.callout.framing);
      const callout: CreateCalloutInput = {
        framing: {
          profile: profileData,
          type: calloutTemplateData.callout.framing.type,
          tags,
          whiteboard: handleCreateWhiteboard(calloutTemplateData.callout.framing.whiteboard),
          link: mapLinkDataToCreateLinkInput(calloutTemplateData.callout.framing.link),
          memo: mapMemoDataToCreateMemoInput(calloutTemplateData.callout.framing.memo),
        },
        settings: mapCalloutSettingsFormToCalloutSettingsModel(calloutTemplateData.callout.settings),
      };
      callout.contributionDefaults = handleContributionDefaults(calloutTemplateData.callout.contributionDefaults);
      if (!(calloutTemplateData.callout?.framing.type === CalloutFramingType.Whiteboard)) {
        delete callout.framing.whiteboard; // if the callout is not a whiteboard, we don't need the whiteboard field
      } else {
        // if there are preview images for upload, do not use the existing preview
        if (calloutTemplateData.whiteboardPreviewImages) {
          delete callout.framing.whiteboard?.profile?.visuals;
        }
      }
      if (!calloutTemplateData.callout?.settings.contribution.allowedTypes.includes(CalloutContributionType.Post)) {
        delete callout.contributionDefaults?.postDescription;
      }
      if (
        !calloutTemplateData.callout?.settings.contribution.allowedTypes.includes(CalloutContributionType.Whiteboard)
      ) {
        delete callout.contributionDefaults?.whiteboardContent;
      }

      result.calloutData = callout;
      break;
    }
    case TemplateType.Space: {
      // TODO: Nothing to do here, for now we cannot create SpaceTemplates with data inside, we can only copy another Space
      throw new Error('Call toCreateTemplateFromSpaceMutationVariables instead');
    }
    case TemplateType.CommunityGuidelines: {
      const communityGuidelinesTemplateData = values as TemplateCommunityGuidelinesFormSubmittedValues;
      const { profileData } = handleCreateProfile(communityGuidelinesTemplateData.communityGuidelines);
      result.communityGuidelinesData = {
        profile: profileData,
        // Community Guidelines don't have tags
      };
      break;
    }
    case TemplateType.Post: {
      const postData = values as TemplatePostFormSubmittedValues;
      result.postDefaultDescription = postData.postDefaultDescription;
      break;
    }
    case TemplateType.Whiteboard: {
      const whiteboardTemplateData = values as TemplateWhiteboardFormSubmittedValues;
      result.whiteboard = handleCreateWhiteboard(whiteboardTemplateData.whiteboard);
      break;
    }
  }

  return result;
};

export const toCreateTemplateFromSpaceMutationVariables = (
  templatesSetId: string,
  values: TemplateSpaceFormSubmittedValues
): CreateTemplateFromSpaceMutationVariables => {
  // TODO: Maybe in the future we don't receive collaborationId to copy the collaboration and we receive the collaboration data directly
  if (!values.spaceId) {
    throw new Error('Space ID required to create a template from a collaboration');
  }

  return {
    spaceId: values.spaceId,
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
    recursive: values.recursive,
  };
};

export const toCreateTemplateFromSpaceContentMutationVariables = (
  templatesSetId: string,
  values: TemplateSpaceFormSubmittedValues
): CreateTemplateFromContentSpaceMutationVariables => {
  if (!values.contentSpaceId) {
    throw new Error('contentSpaceId required to create a template from a collaboration');
  }

  return {
    contentSpaceId: values.contentSpaceId,
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
  references?: Partial<ReferenceModel>[];
}

export const mapTemplateProfileToUpdateProfileInput = (profile?: TemplateProfile): UpdateProfileInput => {
  return {
    displayName: profile?.displayName,
    description: profile?.description,
    tagline: profile?.tagline,
    tagsets: mapTagsetsToUpdateTagsets(profile),
    references: mapReferenceModelsToUpdateReferenceInputs(profile?.references),
  };
};

// For updating a template we update the Template itself and the elements inside it separately
export const toUpdateTemplateMutationVariables = (
  templateId: string,
  template: AnyTemplate,
  newValues: AnyTemplateFormSubmittedValues
): {
  updateTemplateVariables: UpdateTemplateMutationVariables;
  updateCalloutVariables?: UpdateCalloutTemplateMutationVariables;
  updateCommunityGuidelinesVariables?: UpdateCommunityGuidelinesMutationVariables;
  updateSpaceContentTemplateVariables?: UpdateTemplateFromSpaceMutationVariables;
} => {
  const updateTemplateVariables: UpdateTemplateMutationVariables = {
    templateId: templateId!,
    profile: mapTemplateProfileToUpdateProfileInput(newValues.profile),
    ...shouldRequestPreviewVisuals(newValues),
  };
  switch (template.type) {
    case TemplateType.Callout: {
      const calloutTemplateData = newValues as TemplateCalloutFormSubmittedValues;
      const settings = mapCalloutSettingsFormToCalloutUpdateSettings(calloutTemplateData.callout?.settings);

      const updateCalloutVariables: UpdateCalloutTemplateMutationVariables = {
        calloutData: {
          ID: (template as CalloutTemplate).callout?.id!,
          framing: {
            profile: mapTemplateProfileToUpdateProfileInput(calloutTemplateData.callout?.framing.profile),
            type: calloutTemplateData.callout?.framing.type,
            whiteboardContent: calloutTemplateData.callout?.framing.whiteboard?.content,
            link: mapLinkDataToUpdateLinkInput(calloutTemplateData.callout?.framing.link),
            memoContent: calloutTemplateData.callout?.framing.memo?.markdown,
          },
          settings,
          contributionDefaults: handleContributionDefaults(calloutTemplateData.callout?.contributionDefaults),
        },
      };
      // Delete useless fields and leave only the fields relevant to the callout types
      if (!(calloutTemplateData.callout?.framing.type === CalloutFramingType.Whiteboard)) {
        delete updateCalloutVariables.calloutData?.framing?.whiteboardContent;
      }
      if (!calloutTemplateData.callout?.settings.contribution.allowedTypes.includes(CalloutContributionType.Post)) {
        delete updateCalloutVariables.calloutData?.contributionDefaults?.postDescription;
      }
      if (
        !calloutTemplateData.callout?.settings.contribution.allowedTypes.includes(CalloutContributionType.Whiteboard)
      ) {
        delete updateCalloutVariables.calloutData?.contributionDefaults?.whiteboardContent;
      }

      return {
        updateTemplateVariables,
        updateCalloutVariables,
      };
    }
    case TemplateType.Space: {
      // Special case: In SpaceTemplates we update the spaceId in the formik values to
      // mark that this template should load its content from another space.
      // Then updateSpaceContentTemplateVariables will be returned and the mutation will be called.
      // If the spaceId remains the same, we just update the template profile.
      const oldSelectedSpaceId = (template as SpaceTemplate).contentSpace?.id;
      const { spaceId: newModelSpaceId, recursive } = newValues as TemplateSpaceFormSubmittedValues;
      if (oldSelectedSpaceId && newModelSpaceId && oldSelectedSpaceId !== newModelSpaceId) {
        const updateSpaceContentTemplateVariables: UpdateTemplateFromSpaceMutationVariables = {
          templateId,
          spaceId: newModelSpaceId,
          recursive,
        };
        return {
          updateTemplateVariables,
          updateSpaceContentTemplateVariables,
        };
      } else {
        // Space selected didn't change, just update the template values
        return {
          updateTemplateVariables,
        };
      }
    }
    case TemplateType.CommunityGuidelines: {
      const communityGuidelinesTemplateData = newValues as TemplateCommunityGuidelinesFormSubmittedValues;
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
        newValues as TemplatePostFormSubmittedValues
      ).postDefaultDescription;
      return {
        updateTemplateVariables,
      };
    }
    case TemplateType.Whiteboard: {
      updateTemplateVariables.whiteboardContent = (
        newValues as TemplateWhiteboardFormSubmittedValues
      ).whiteboard?.content;
      return {
        updateTemplateVariables,
      };
    }
  }
};
