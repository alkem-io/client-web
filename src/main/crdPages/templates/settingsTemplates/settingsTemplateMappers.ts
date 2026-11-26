import type {
  DocType,
  SettingsPostTemplateCardFragment,
  SettingsPostTemplateContentQuery,
  SettingsPostTemplateLibraryQuery,
  SettingsSaveAsSourceQuery,
} from '@/core/apollo/generated-v2/graphql-schema';
import type {
  FramingKind,
  TemplateCardData,
  TemplateContent,
  TemplateFormPreview,
} from '@/crd/components/templates/types';
import type { FormQuestionKind } from '@/crd/forms/callout/types';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';

type LibraryNode = SettingsPostTemplateLibraryQuery['library']['edges'][number]['node'];
export type PostLibraryTemplate = Extract<LibraryNode, { kind: unknown }>;
type ContentNode = NonNullable<SettingsPostTemplateContentQuery['node']>;
type PostTemplateNode = Extract<ContentNode, { kind: unknown }>;
type TemplateBody = NonNullable<PostTemplateNode['body']>;
export type PostTemplateBody = Extract<TemplateBody, { contentKind: unknown }>;
type ContentSubtreeNode = NonNullable<SettingsPostTemplateContentQuery['subtree']>['edges'][number]['node'];
export type TemplateDocumentNode = Extract<ContentSubtreeNode, { role: unknown }>;
type SourceSubtreeNode = NonNullable<SettingsSaveAsSourceQuery['subtree']>['edges'][number]['node'];
export type SourceSpaceNode = Extract<SourceSubtreeNode, { isContentPublic: unknown }>;
export type SourcePostNode = Extract<SourceSubtreeNode, { contentKind: unknown }>;

/** A POST template's content as read by `SettingsPostTemplateContent`: the body post and the documents under it. */
export type NativePostTemplate = {
  body: PostTemplateBody;
  documents: TemplateDocumentNode[];
};

type CalloutTemplateContent = Extract<TemplateContent, { type: 'callout' }>;
type ContributionType = CalloutTemplateContent['allowedContributionTypes'][number];

/**
 * Native post `contentKind` (+ the content document's `docType`) → the CRD framing kind, per the callout-framing
 * correspondence of specs/008-posts-stages-forms/data-model.md "Kind and policy correspondence": framing
 * whiteboard / memo / collabora_document are `document` posts with doc_type excalidraw / richtext / an office type;
 * link is `cta`, media_gallery is `gallery`. `spaces` shows legacy's 'none' (legacy mapGqlFramingType has no spaces
 * case), as does any other kind (its default branch).
 */
export function postFramingKind(contentKind: string, docType: DocType | undefined): FramingKind {
  switch (contentKind) {
    case 'document':
      if (docType === 'EXCALIDRAW') return 'whiteboard';
      if (docType === 'RICHTEXT') return 'memo';
      return 'document';
    case 'cta':
      return 'cta';
    case 'gallery':
      return 'image';
    case 'poll':
      return 'poll';
    case 'contributors':
      return 'contributors';
    case 'form':
      return 'form';
    default:
      return 'none';
  }
}

/** `SettingsPostTemplateCard` → `TemplateCardData` of the CRD `callout` type (a POST template is a whole post). */
export function mapPostTemplateCard(template: SettingsPostTemplateCardFragment, ownerLabel?: string): TemplateCardData {
  if (template.kind !== 'POST') throw new Error(`Post template picker received a ${template.kind} template`);
  return {
    id: template.id,
    type: 'callout',
    name: template.about.displayName,
    description: template.about.description ?? '',
    tags: template.tags,
    bannerUrl: template.about.card?.file.url || undefined,
    color: pickColorFromId(template.id),
    url: template.url ?? undefined,
    ownerLabel,
    classification: undefined,
  };
}

const packName = (template: PostLibraryTemplate) =>
  'about' in template.scope ? template.scope.about.displayName : undefined;

/** Account source: the owning pack's name. */
export const postAccountOwnerLabel = (template: PostLibraryTemplate) => packName(template);

/** Platform source: the provider's name, else the pack's name. */
export const postPlatformOwnerLabel = (template: PostLibraryTemplate) =>
  template.provider?.about?.displayName ?? packName(template);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const optionalString = (record: Record<string, unknown>, key: string, owner: string): string | undefined => {
  const value = record[key];
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') throw new Error(`${owner}.${key} is not a string`);
  return value;
};

const QUESTION_KIND: Record<string, FormQuestionKind> = {
  short_text: 'SHORT_TEXT',
  long_text: 'LONG_TEXT',
  single_choice: 'SINGLE_CHOICE',
  multiple_choice: 'MULTIPLE_CHOICE',
};

/** The form definition from the form post's `response_defaults` (schema.sql `post_kind form.response_defaults`). */
function mapFormPreview(responseDefaults: unknown): TemplateFormPreview {
  if (!isRecord(responseDefaults) || !Array.isArray(responseDefaults.questions)) {
    throw new Error('Form post template has no response_defaults questions');
  }
  return {
    title: optionalString(responseDefaults, 'title', 'response_defaults') || undefined,
    description: optionalString(responseDefaults, 'description', 'response_defaults') || undefined,
    questions: responseDefaults.questions.map((question, index) => {
      if (!isRecord(question)) throw new Error(`response_defaults.questions[${index}] is not an object`);
      const owner = `response_defaults.questions[${index}]`;
      const type = QUESTION_KIND[String(question.type)];
      if (!type) throw new Error(`${owner}.type ${String(question.type)} is not a form question type`);
      const options = Array.isArray(question.options) ? question.options : [];
      return {
        prompt: optionalString(question, 'prompt', owner) ?? '',
        explanation: optionalString(question, 'explanation', owner) || undefined,
        type,
        required: question.required === true,
        options: options.map((option, optionIndex) => {
          if (!isRecord(option)) throw new Error(`${owner}.options[${optionIndex}] is not an object`);
          return optionalString(option, 'label', `${owner}.options[${optionIndex}]`) ?? '';
        }),
      };
    }),
  };
}

/**
 * The response type the post accepts (A4.10: `response_kind` is the one allowed type or NULL): text → post,
 * link → link, document → whiteboard / memo by `response_policy.allowed_document_types` (excalidraw / richtext).
 * Office document responses have no CRD contribution type, as legacy's mapAllowedContributionTypes dropped them.
 */
function allowedContributionTypes(body: PostTemplateBody): ContributionType[] {
  switch (body.responseKind) {
    case 'text':
      return ['post'];
    case 'link':
      return ['link'];
    case 'document': {
      const policy = isRecord(body.responsePolicy) ? body.responsePolicy : {};
      const docTypes = Array.isArray(policy.allowed_document_types) ? policy.allowed_document_types : [];
      const types: ContributionType[] = [];
      if (docTypes.includes('excalidraw')) types.push('whiteboard');
      if (docTypes.includes('richtext')) types.push('memo');
      return types;
    }
    default:
      return [];
  }
}

/**
 * The POST template's body → the callout preview (templates-screens "callout template preview": Template.body →
 * Post.about / contentKind / content / responseKind / responsePolicy / responseDefaults). Response defaults keep
 * `display_name` and `description` (008 data-model "Response defaults"); the starting board is the body post's
 * RESPONSE_DEFAULT whiteboard document.
 */
export function mapPostTemplateContent({ body, documents }: NativePostTemplate): CalloutTemplateContent {
  const content = body.content;
  const document = content && 'document' in content ? content.document : undefined;
  const framingKind = postFramingKind(body.contentKind, document?.docType);
  const defaults = isRecord(body.responseDefaults) ? body.responseDefaults : {};
  const isForm = framingKind === 'form';
  const startingBoard = documents.find(doc => doc.role === 'RESPONSE_DEFAULT' && doc.docType === 'EXCALIDRAW');
  const links = [...body.links].sort((a, b) => a.sortOrder - b.sortOrder);
  return {
    type: 'callout',
    sourceCalloutId: body.id,
    framingKind,
    framingTitle: body.about.displayName,
    framingDescription: body.about.description ?? '',
    framingWhiteboardPreviewImageUrl: framingKind === 'whiteboard' ? document?.preview?.url || undefined : undefined,
    framingMemoContent: framingKind === 'memo' ? (document?.textSnapshot ?? undefined) : undefined,
    framingCollaboraDoc:
      framingKind === 'document' && document
        ? { displayName: document.about?.displayName ?? '', documentType: document.docType }
        : undefined,
    framingLinks:
      framingKind === 'cta' && content && 'link' in content
        ? [{ name: content.link.title || content.link.uri, uri: content.link.uri }]
        : undefined,
    framingMediaImages:
      framingKind === 'image' && content && 'images' in content
        ? content.images.map(image => ({ uri: image.file.url, alt: image.alt || undefined }))
        : undefined,
    framingPoll:
      framingKind === 'poll' && content && 'question' in content
        ? {
            question: content.question,
            options: [...content.options].sort((a, b) => a.sortOrder - b.sortOrder).map(option => option.value),
          }
        : undefined,
    framingForm: isForm ? mapFormPreview(body.responseDefaults) : undefined,
    references:
      links.length > 0
        ? links.map(link => ({
            id: link.id,
            name: link.title || link.uri,
            uri: link.uri,
            description: link.description || undefined,
          }))
        : undefined,
    allowedContributionTypes: allowedContributionTypes(body),
    commentsEnabled: body.commentsEnabled,
    defaultPostDescription: isForm
      ? undefined
      : optionalString(defaults, 'description', 'response_defaults') || undefined,
    defaultWhiteboardAvailable: Boolean(startingBoard),
    defaultWhiteboardName: isForm
      ? undefined
      : optionalString(defaults, 'display_name', 'response_defaults') || undefined,
  };
}

const isSourceSpace = (node: SourceSubtreeNode): node is SourceSpaceNode => node.entityType === 'space';
const isSourcePost = (node: SourceSubtreeNode): node is SourcePostNode => node.entityType === 'post';

/**
 * A live space read by `SettingsSaveAsSource` (the root with `includeRoot`, its posts and its child spaces) → the
 * captured-structure preview of the save-as form: phases from the root's stages, posts as starter callouts grouped by
 * their stage, child spaces as subspace tiles (templates-screens "save a space/subspace as template: preview").
 */
export function mapLiveSpaceStructure(
  rootId: string,
  nodes: SourceSubtreeNode[]
): Extract<TemplateContent, { type: 'space' }> {
  const root = nodes.filter(isSourceSpace).find(node => node.id === rootId);
  const stages = [...(root?.stages ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  const posts = nodes.filter(isSourcePost).sort((a, b) => a.sortOrder - b.sortOrder);
  const children = nodes.filter(isSourceSpace).filter(node => node.id !== rootId);
  return {
    type: 'space',
    phases: stages.map(stage => ({ name: stage.name, description: stage.description || undefined })),
    starterCallouts: posts.map(post => ({
      name: post.about.displayName,
      framingKind: postFramingKind(
        post.contentKind,
        post.content && 'document' in post.content ? post.content.document.docType : undefined
      ),
      flowStateName: post.stage?.name,
      description: post.about.description || undefined,
    })),
    subspaceTemplates: children.map(space => ({
      id: space.id,
      name: space.about.displayName,
      bannerUrl: space.about.card?.file.url || undefined,
      isPrivate: !space.isContentPublic,
    })),
  };
}
