import produce from 'immer';
import { UpdateReferenceInput, UpdateTagsetInput } from '../../../../../../core/apollo/generated/graphql-schema';
import { CreateTemplateMutationVariables, TemplateType, UpdateTemplateMutationVariables } from '../../../../../../core/apollo/generated/graphql-schema';
import { AnyTemplateFormSubmittedValues } from '../TemplateForm';
import { CommunityGuidelinesTemplateFormSubmittedValues } from '../CommunityGuidelinesTemplateForm';
import { WritableDraft } from 'immer/dist/internal';
import { InnovationFlowTemplateFormSubmittedValues } from '../InnovationFlowTemplateForm';
import { WhiteboardTemplateFormSubmittedValues } from '../WhiteboardTemplateForm';

interface TemplateTagsets {
  id?: string;
  name?: string;
  tags?: string[];
}

export const mapTagsetsToUpdateTagsets = (tagsets: TemplateTagsets[] | undefined): UpdateTagsetInput[] | undefined => {
  return tagsets?.map(tagset => ({
    ID: tagset.id ?? '',
    tags: tagset.tags ?? []
  }));
}

interface TemplateReferences {
  id?: string;
  name?: string;
  uri?: string;
  description?: string;
}

export const mapReferencesToUpdateReferences = (references: TemplateReferences[] | undefined): UpdateReferenceInput[] | undefined => {
  return references?.map(reference => ({
    ID: reference.id ?? '',
    description: reference.description,
    uri: reference.uri,
    name: reference.name,
  }));
}

interface ProfileWithTags {
  profile: {
    tagsets?: {
      ID: string;
      tags: string[];
    }[];
  }
}

interface ProfileWithReferences {
  profile: {
    references?: {
      ID: string;
      name?: string;
      uri?: string;
      description?: string;
    }[];
  }
}

// For creation, instead of tagsets, we want tags at the parent level
const handleTags = (draft: WritableDraft<ProfileWithTags>) => {
  const tags = draft.profile.tagsets?.[0]?.tags ?? [];
  if (tags.length > 0) {
    draft['tags'] = tags;
  }
  delete draft.profile.tagsets;
}

// For creation, instead of references, we need to pass referencesData without ids
const handleReferences = (draft: WritableDraft<ProfileWithReferences>) => {
  const references = draft.profile.references ?? [];
  if (references.length > 0) {
    draft.profile['referencesData'] = references.map(ref => ({ name: ref.name, uri: ref.uri, description: ref.description }));
  }
  delete draft.profile.references;
}

// Always remove the preview images from the call, they are handled separately
const handlePreviewImages = (draft) => {
  if (draft.whiteboardPreviewImages) {
    delete draft.whiteboardPreviewImages;
    draft['includeProfileVisuals'] = true;  // Will tell the mutation to retrieve the CARD visual after creation/update to upload the preview images of f.e. whiteboards
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
        communityGuidelinesDraft['communityGuidelinesData'] = communityGuidelinesDraft.communityGuidelines
        if (communityGuidelinesDraft.communityGuidelines?.profile.references) {
          handleReferences(communityGuidelinesDraft.communityGuidelines);
        }
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
          displayName: 'Innovation Flow Template'
        };
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
          whiteboardDraft.whiteboard['profileData'] = { // This shoudln't be required by the server but for now can stay
            displayName: 'Whiteboard Template'
          };
        }
        delete draft['callout'];
        delete draft['communityGuidelines'];
        delete draft['innovationFlow'];
      });
    }

  }

  // After those productions TypeScript is completely clueless of what's in newValues.
  //@ts-ignore
  return {
    templatesSetId: templatesSetId,
    type: templateType,
    ...newValues
  };
}


const mapReferences = (ref: { id?: string, ID?: string; name?: string, uri?: string, description?: string }) => (
  {
    ID: ref.ID ?? ref.id ?? '', // We have some cases where id is lowercase, see ProfileReferenceSegment
    name: ref.name,
    uri: ref.uri,
    description: ref.description
  }
);


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
      const communityGuidelinesDraft = draft as CommunityGuidelinesTemplateFormSubmittedValues;
      if (communityGuidelinesDraft.communityGuidelines?.profile.references) {
        communityGuidelinesDraft.communityGuidelines.profile.references = communityGuidelinesDraft.communityGuidelines.profile.references.map(mapReferences);
      }
    }
  });

  return {
    templateId: templateId!,
    ...newValues,
  }
}