import type {
  CreateSpacePickerCardFragment,
  CreateSpacePickerLibraryQuery,
  CreateSpaceTemplateContentQuery,
} from '@/core/apollo/generated-v2/graphql-schema';
import type { FramingKind, TemplateCardData, TemplateContent } from '@/crd/components/templates/types';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';

type LibraryNode = CreateSpacePickerLibraryQuery['library']['edges'][number]['node'];
export type LibraryTemplate = Extract<LibraryNode, { kind: unknown }>;
type ContentNode = NonNullable<CreateSpaceTemplateContentQuery['node']>;
export type SpaceTemplateNode = Extract<ContentNode, { about: unknown }>;
type SubtreeNode = NonNullable<CreateSpaceTemplateContentQuery['subtree']>['edges'][number]['node'];
type SubtreeSpace = Extract<SubtreeNode, { isContentPublic: unknown }>;
type SubtreePost = Extract<SubtreeNode, { contentKind: unknown }>;

/** A space template's content as read by `CreateSpaceTemplateContent`: the `node` and every `subtree` page's nodes. */
export type NativeSpaceTemplate = {
  template: SpaceTemplateNode;
  nodes: SubtreeNode[];
};

export type SpaceTemplatePrefill = {
  templateName: string;
  displayName: string;
  tagline: string;
  description: string;
  tags: string[];
};

/**
 * Native post `contentKind` → the CRD framing kind, per the callout-framing correspondence of
 * specs/008-posts-stages-forms/data-model.md "Kind and policy correspondence". Native `document`
 * carries legacy whiteboard, memo and Collabora framings alike; telling them apart needs
 * Post.content → DocumentContent.document.docType (surface.graphql:233, :306), not served yet, so it
 * is shown as `document`. `spaces` shows legacy's 'none'.
 */
const FRAMING_BY_CONTENT_KIND: Record<string, FramingKind> = {
  text: 'none',
  document: 'document',
  cta: 'cta',
  gallery: 'image',
  poll: 'poll',
  contributors: 'contributors',
  spaces: 'none', // legacy mapGqlFramingType has no spaces case; no signed change, so legacy's 'none'
  form: 'form',
};

// Any other kind falls back to 'none', as legacy mapGqlFramingType's default branch does.
const framingKind = (contentKind: string): FramingKind => FRAMING_BY_CONTENT_KIND[contentKind] ?? 'none';

/** `CreateSpacePickerCard` → `TemplateCardData`; banner = the body's card, else the template's own card (item 9). */
export function mapSpaceTemplateCard(template: CreateSpacePickerCardFragment, ownerLabel?: string): TemplateCardData {
  if (template.kind !== 'SPACE') throw new Error(`Space template picker received a ${template.kind} template`);
  const body = template.body && 'about' in template.body ? template.body : undefined;
  const bannerUrl = body?.about.card?.file.url || template.about.card?.file.url;
  return {
    id: template.id,
    type: 'space',
    name: template.about.displayName,
    description: template.about.description ?? '',
    tags: template.tags,
    bannerUrl: bannerUrl || undefined,
    color: pickColorFromId(template.id),
    url: template.url ?? undefined,
    ownerLabel,
    classification: undefined,
  };
}

const packName = (template: LibraryTemplate) =>
  'about' in template.scope ? template.scope.about.displayName : undefined;

/** Account source: the owning pack's name. */
export const accountOwnerLabel = (template: LibraryTemplate) => packName(template);

/** Platform source: the provider's name, else the pack's name. */
export const platformOwnerLabel = (template: LibraryTemplate) =>
  template.provider?.about?.displayName ?? packName(template);

const isSpace = (node: SubtreeNode): node is SubtreeSpace => node.entityType === 'space';
const isPost = (node: SubtreeNode): node is SubtreePost => node.entityType === 'post';

const findBody = ({ template, nodes }: NativeSpaceTemplate) => {
  const bodyId = template.body?.id;
  return bodyId ? nodes.filter(isSpace).find(node => node.id === bodyId) : undefined;
};

/** The template's body (preview): phases from the body's stages, posts as starter callouts, other spaces as tiles. */
export function mapSpaceTemplateContent(native: NativeSpaceTemplate): Extract<TemplateContent, { type: 'space' }> {
  const body = findBody(native);
  const stages = [...(body?.stages ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  const posts = native.nodes.filter(isPost).sort((a, b) => a.sortOrder - b.sortOrder);
  const children = native.nodes.filter(isSpace).filter(node => node.id !== body?.id);
  return {
    type: 'space',
    phases: stages.map(stage => ({ name: stage.name, description: stage.description || undefined })),
    starterCallouts: posts.map(post => ({
      name: post.about.displayName,
      framingKind: framingKind(post.contentKind),
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

/** The form values applying the template fills (item 9 §(3)): the body's values, else the template's own. */
export function spaceTemplatePrefill(native: NativeSpaceTemplate): SpaceTemplatePrefill {
  const body = findBody(native);
  const { template } = native;
  const bodyTags = body?.tags ?? [];
  return {
    templateName: template.about.displayName,
    displayName: body?.about.displayName || template.about.displayName || '',
    tagline: body?.about.tagline || '',
    description: body?.about.description || template.about.description || '',
    tags: bodyTags.length > 0 ? bodyTags : template.tags,
  };
}
