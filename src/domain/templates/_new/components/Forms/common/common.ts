import produce from 'immer';
import { CreateTemplateMutationVariables, TemplateType, UpdateTemplateMutationVariables } from '../../../../../../core/apollo/generated/graphql-schema';
import { AnyTemplateFormSubmittedValues } from '../TemplateForm';
import { CommunityGuidelinesTemplateFormSubmittedValues } from '../CommunityGuidelinesTemplateForm';
import { WritableDraft } from 'immer/dist/internal';
//!! All the ugly things, those `as`, those mappings that drive TypeScript crazy, put them in here

/**
 * This function is used to handle the conversion between tagsets and CreateProfileInput which only has tags at the parent level
 * for example:
 * template: {
 *    id: '1',
 *    profile: {
 *      displayName: 'name',
 *      tagsets: [{ID: '1', tags: ['tag1', 'tag2']}]
 *    }
 * }
 *
 * gets converted into:
 * template: {
 *    id: '1',
 *    profile: {
 *     displayName: 'name',
 *    },
 *    tags: ['tag1', 'tag2']}
 * }
 * @param obj
 * @returns
 */
/*
const handleCreateTags =
  <T extends {
    profile: {
      tagsets?: {
        ID?: string;
        tags: string[];
      }[];
    }
  }>
    (obj: T): // Receives an object of type T that has a profile with tagsets inside
    Omit<T, 'profile'>  // Return that same object but without profile for now
    & { profile: Omit<T['profile'], 'tagsets'> } // With a profile but without the tagsets
    & { tags?: string[] } => {// And with a tags field that is just an array of strings

    const { profile, ...rest } = obj ?? {};
    const { tagsets, ...restProfile } = profile;
    const newObject = {
      ...rest,
      profile: {
        ...restProfile
      },
      tags: tagsets?.[0]?.tags ?? []
    };

    //!!
    //@ts-ignore
    return newObject;
  }

const handleReferences = <T extends {
  profile: {
    references?: {
      ID?: string;
      name?: string;
      uri?: string;
      description?: string;
    }[];
  }
}>
  (obj: T): // Receives an object of type T that has a profile with references inside
  Omit<T, 'profile'>  // Return that same object but without profile for now
  & {
    // With a profile but without the references and with referencesData
    profile: Omit<T['profile'], 'references'> & { referencesData?: { name?: string, uri?: string, description?: string }[] }
  } => {
  const { profile, ...rest } = obj ?? {};
  const { references, ...restProfile } = profile;
  const newObject = {
    ...rest,
    profile: {
      ...restProfile,
      referencesData: references?.map(r => ({ name: r.name, uri: r.uri, description: r.description }))
    },
  };
  //!!
  //@ts-ignore
  return newObject;
}
*/

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

export const toCreateTemplateMutationVariables = (
  templatesSetId: string,
  templateType: TemplateType,
  values: AnyTemplateFormSubmittedValues
): CreateTemplateMutationVariables => {
  let newValues = produce(values, draft => {
    handleTags(draft);
    handleReferences(draft);
  });


  switch (templateType) {
    case TemplateType.Post: {
      newValues = produce(newValues, draft => {
        delete draft['callout'];
        delete draft['communityGuidelines'];
        delete draft['innovationFlow'];
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
      });
    }
  }

  //@ts-ignore
  return {
    templatesSetId: templatesSetId,
    type: templateType,
    ...newValues
  };
}


const mapReferences = (ref: { id?: string, ID?: string; name?: string, uri?: string, description?: string }) => (
  {
    ID: ref.ID ?? ref.id ?? '', // Yes, we have some cases where id is lowercase, see ProfileReferenceSegment
    name: ref.name,
    uri: ref.uri,
    description: ref.description
  }
);


// There are less problems mapping the updates
export const toUpdateTemplateMutationVariables = (
  templateId: string,
  values: AnyTemplateFormSubmittedValues
): UpdateTemplateMutationVariables => {
  let newValues = produce(values, draft => {
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