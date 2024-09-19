import produce from 'immer';
import {
  CalloutType,
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

// TODO MAYBE: Create the mappings mannually instead of using produce,
// maybe that's the best way to keep the Typescript integrity
interface TemplateTagset {
  id?: string;
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

interface TemplateReference {
  id?: string;
  name?: string;
  uri?: string;
  description?: string;
}

export const mapReferencesToUpdateReferences = (
  references: TemplateReference[] | undefined
): UpdateReferenceInput[] | undefined => {
  return references?.map(reference => ({
    ID: reference.id ?? '',
    description: reference.description,
    uri: reference.uri,
    name: reference.name,
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

/* ==========================
 * CREATE TEMPLATES MUTATIONS
 * ==========================
 */
interface ProfileWithTags {
  profile: {
    tagsets?: {
      ID?: string;
      tags: string[];
    }[];
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

// For creation, instead of tagsets, we want tags at the parent level
const handleTags = (draft: WritableDraft<ProfileWithTags>) => {
  const tags = draft.profile.tagsets?.[0]?.tags ?? [];
  if (tags.length > 0) {
    draft['tags'] = tags;
  }
  delete draft.profile.tagsets;
};

// For creation, instead of references, we need to pass referencesData without ids
const handleReferences = (draft: WritableDraft<ProfileWithReferences>) => {
  const references = draft.profile.references ?? [];
  if (references.length > 0) {
    draft.profile['referencesData'] = references.map(ref => ({
      name: ref.name,
      uri: ref.uri,
      description: ref.description,
    }));
  }
  delete draft.profile.references;
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
  let newValues = produce(values, draft => {
    handleTags(draft);
    handleReferences(draft);
    handlePreviewImages(draft);
  });

  switch (templateType) {
    case TemplateType.Callout: {
      newValues = produce(newValues, draft => {
        const calloutDraft = draft as CalloutTemplateFormSubmittedValues;
        if (!calloutDraft.callout) {
          throw new Error('Callout template must have a callout object');
        }

        delete calloutDraft.callout['id'];

        if (calloutDraft.callout?.framing) {
          handleTags(calloutDraft.callout.framing);
          handleReferences(calloutDraft.callout.framing);
          delete calloutDraft.callout.framing['id'];
        }

        delete calloutDraft.callout.contributionDefaults?.['id'];

        switch (calloutDraft.callout?.type) {
          case CalloutType.Post: {
            delete calloutDraft.callout.contributionDefaults?.whiteboardContent;
            delete calloutDraft.callout.framing.whiteboard;
            break;
          }
          case CalloutType.PostCollection: {
            delete calloutDraft.callout.contributionDefaults?.whiteboardContent;
            delete calloutDraft.callout.framing.whiteboard;
            break;
          }
          case CalloutType.LinkCollection: {
            delete calloutDraft.callout.contributionDefaults;
            delete calloutDraft.callout.framing.whiteboard;
            break;
          }
          case CalloutType.Whiteboard: {
            delete calloutDraft.callout.contributionDefaults;
            if (calloutDraft.callout.framing.whiteboard) {
              const content = calloutDraft.callout.framing.whiteboard.content;
              calloutDraft.callout.framing.whiteboard = {
                content,
              };
              calloutDraft.callout.framing.whiteboard['profileData'] = {
                displayName: 'Whiteboard Template',
              };
            }
            break;
          }
          case CalloutType.WhiteboardCollection: {
            delete calloutDraft.callout.framing.whiteboard;
            delete calloutDraft.callout.contributionDefaults?.postDescription;
            break;
          }
        }
        calloutDraft.callout['contributionPolicy'] = { state: 'OPEN' };
        delete calloutDraft.callout.framing.profile['id'];
        delete calloutDraft.callout.framing.profile['storageBucket'];

        calloutDraft['calloutData'] = calloutDraft.callout;
        delete draft['callout'];

        delete draft['communityGuidelines'];
        delete draft['innovationFlow'];
        delete draft['whiteboard'];
      });
      break;
    }
    case TemplateType.Post: {
      newValues = produce(newValues, draft => {
        delete draft['callout'];
        delete draft['communityGuidelines'];
        delete draft['innovationFlow'];
        delete draft['whiteboard'];
      });
      break;
    }
    case TemplateType.CommunityGuidelines: {
      newValues = produce(newValues, draft => {
        const communityGuidelinesDraft = draft as CommunityGuidelinesTemplateFormSubmittedValues;
        communityGuidelinesDraft['communityGuidelinesData'] = communityGuidelinesDraft.communityGuidelines;
        if (communityGuidelinesDraft.communityGuidelines?.profile.references) {
          handleReferences(communityGuidelinesDraft.communityGuidelines);
        }

        delete communityGuidelinesDraft['communityGuidelinesData']['id'];
        delete communityGuidelinesDraft.communityGuidelines?.profile?.['id'];

        delete draft['callout'];
        delete draft['communityGuidelines'];
        delete draft['innovationFlow'];
        delete draft['whiteboard'];
      });
      break;
    }
    case TemplateType.InnovationFlow: {
      newValues = produce(newValues, draft => {
        const innovationFlowDraft = draft as InnovationFlowTemplateFormSubmittedValues;
        innovationFlowDraft['innovationFlowData'] = innovationFlowDraft.innovationFlow;
        innovationFlowDraft['innovationFlowData']['profile'] = {
          displayName: 'Innovation Flow Template',
        };
        delete innovationFlowDraft['innovationFlowData']['id'];

        delete draft['callout'];
        delete draft['communityGuidelines'];
        delete draft['innovationFlow'];
        delete draft['whiteboard'];
      });
      break;
    }
    case TemplateType.Whiteboard: {
      newValues = produce(newValues, draft => {
        const whiteboardDraft = draft as WhiteboardTemplateFormSubmittedValues;
        if (whiteboardDraft.whiteboard) {
          delete whiteboardDraft.whiteboard['profile'];
          delete whiteboardDraft.whiteboard['id'];
          whiteboardDraft.whiteboard['profileData'] = {
            // This shoudln't be required by the server but for now can stay
            displayName: 'Whiteboard Template',
          };
        }
        delete draft['callout'];
        delete draft['communityGuidelines'];
        delete draft['innovationFlow'];
      });
    }
  }

  newValues = produce(newValues, draft => {
    draft['profileData'] = draft.profile;
    delete draft['profileData'].id;
    delete draft['profileData'].defaultTagset;
    //@ts-ignore
    delete draft.profile;
  });

  // After those productions TypeScript is completely clueless of what's in newValues.
  //@ts-ignore
  return {
    templatesSetId: templatesSetId,
    type: templateType,
    ...newValues,
  };
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
