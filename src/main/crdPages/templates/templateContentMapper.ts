/**
 * GraphQL `TemplateContent` query result → the render-ready `TemplateContent` discriminated union
 * consumed by the CRD preview components. Pure functions — ports the shaping logic the legacy
 * `src/domain/templates/components/Previews/*` did inline.
 *
 * Typed against the generated `TemplateContentQuery` (the `include*` flags make each `*Content`
 * field optional). Poll / Collabora-document framing come from the V1/V2 fragment additions in
 * `TemplateContent.graphql`.
 */

import {
  CalloutContributionType,
  CalloutFramingType,
  type TemplateContentQuery,
} from '@/core/apollo/generated/graphql-schema';
import type {
  FramingKind,
  ReferenceRow,
  TemplateContent,
  TemplateFormValues,
  TemplateType,
} from '@/crd/components/templates/types';

/** `data.lookup.template` from a `TemplateContent` query (non-null). */
export type TemplateContentTemplate = NonNullable<TemplateContentQuery['lookup']['template']>;
type CalloutContentGql = NonNullable<TemplateContentTemplate['callout']>;
type WhiteboardContentGql = NonNullable<TemplateContentTemplate['whiteboard']>;
type CommunityGuidelinesContentGql = NonNullable<TemplateContentTemplate['communityGuidelines']>;
type SpaceContentGql = NonNullable<TemplateContentTemplate['contentSpace']>;

export function mapGqlFramingType(gql: CalloutFramingType): FramingKind {
  switch (gql) {
    case CalloutFramingType.Whiteboard:
      return 'whiteboard';
    case CalloutFramingType.Memo:
      return 'memo';
    case CalloutFramingType.CollaboraDocument:
      return 'document';
    case CalloutFramingType.Link:
      return 'cta';
    case CalloutFramingType.MediaGallery:
      return 'image';
    case CalloutFramingType.Poll:
      return 'poll';
    default:
      return 'none';
  }
}

function mapAllowedContributionTypes(
  allowedTypes: readonly CalloutContributionType[]
): ('post' | 'whiteboard' | 'link')[] {
  const out: ('post' | 'whiteboard' | 'link')[] = [];
  for (const t of allowedTypes) {
    if (t === CalloutContributionType.Post) out.push('post');
    else if (t === CalloutContributionType.Whiteboard) out.push('whiteboard');
    else if (t === CalloutContributionType.Link) out.push('link');
  }
  return out;
}

function mapReferences(
  refs: ReadonlyArray<{ id: string; name: string; uri: string; description?: string }> | undefined
): ReferenceRow[] {
  return (refs ?? []).map(r => ({ id: r.id, name: r.name, uri: r.uri, description: r.description || undefined }));
}

function mapCalloutContent(callout: CalloutContentGql): Extract<TemplateContent, { type: 'callout' }> {
  const { framing, settings, contributionDefaults } = callout;
  const framingKind = mapGqlFramingType(framing.type);
  return {
    type: 'callout',
    framingKind,
    framingTitle: framing.profile.displayName,
    framingDescription: framing.profile.description ?? '',
    framingWhiteboardContent: framingKind === 'whiteboard' ? framing.whiteboard?.content : undefined,
    // Server-rendered whiteboard preview image — D16, 2026-05-18. The Preview dialog (and any
    // read-only preview surface) renders an `<img>` of this when present; falls back to the
    // placeholder text only when the visual is genuinely missing on the server.
    framingWhiteboardPreviewImageUrl:
      framingKind === 'whiteboard' ? framing.whiteboard?.profile.preview?.uri || undefined : undefined,
    framingMemoContent: framingKind === 'memo' ? (framing.memo?.markdown ?? undefined) : undefined,
    framingCollaboraDoc:
      framingKind === 'document' && framing.collaboraDocument
        ? {
            displayName: framing.collaboraDocument.profile.displayName,
            documentType: framing.collaboraDocument.documentType,
          }
        : undefined,
    framingLinks:
      framingKind === 'cta' && framing.link
        ? [{ name: framing.link.profile.displayName || framing.link.uri, uri: framing.link.uri }]
        : undefined,
    framingMediaImages:
      framingKind === 'image' && framing.mediaGallery
        ? framing.mediaGallery.visuals.map(v => ({ uri: v.uri, alt: v.alternativeText || undefined }))
        : undefined,
    framingPoll:
      framingKind === 'poll' && framing.poll
        ? { question: framing.poll.title, options: framing.poll.options.map(o => o.text) }
        : undefined,
    // Callout-references (distinct from the *cta* framing's single Link, which goes on framingLinks).
    // D19, 2026-05-18 — the editor's References rows persist here and the legacy MUI preview rendered
    // them; CRD now does the same via `ReferencesAndTagsStrip` in `CalloutTemplatePreview`.
    references:
      framing.profile.references && framing.profile.references.length > 0
        ? framing.profile.references.map(r => ({
            id: r.id,
            name: r.name,
            uri: r.uri,
            description: r.description || undefined,
          }))
        : undefined,
    allowedContributionTypes: mapAllowedContributionTypes(settings.contribution.allowedTypes),
    commentsEnabled: settings.framing.commentsEnabled,
    defaultPostDescription: contributionDefaults.postDescription || undefined,
    defaultWhiteboardContent: contributionDefaults.whiteboardContent || undefined,
  };
}

function mapWhiteboardContent(whiteboard: WhiteboardContentGql): Extract<TemplateContent, { type: 'whiteboard' }> {
  return {
    type: 'whiteboard',
    whiteboardContent: whiteboard.content,
    previewImageUrl: whiteboard.profile.preview?.uri || undefined,
  };
}

function mapSpaceContent(contentSpace: SpaceContentGql): Extract<TemplateContent, { type: 'space' }> {
  const states = [...contentSpace.collaboration.innovationFlow.states].sort((a, b) => a.sortOrder - b.sortOrder);
  const callouts = [...contentSpace.collaboration.calloutsSet.callouts].sort((a, b) => a.sortOrder - b.sortOrder);
  return {
    type: 'space',
    phases: states.map(s => ({ name: s.displayName, description: s.description || undefined })),
    starterCallouts: callouts.map(c => ({
      name: c.framing.profile.displayName,
      framingKind: mapGqlFramingType(c.framing.type),
    })),
    subspaceTemplates: contentSpace.subspaces.map(sub => ({ name: sub.about.profile.displayName })),
  };
}

function mapCommunityGuidelinesContent(
  cg: CommunityGuidelinesContentGql
): Extract<TemplateContent, { type: 'communityGuidelines' }> {
  return {
    type: 'communityGuidelines',
    title: cg.profile.displayName,
    guidelinesMarkdown: cg.profile.description ?? '',
    references: mapReferences(cg.profile.references),
  };
}

/**
 * `data.lookup.template` (with the right `include*` flags set for `type`) → render-ready content.
 *
 * When the matching `*Content` field is absent (e.g. the include flag wasn't set, or the server
 * returned null), this returns an empty shell of the right shape so the preview renders an empty
 * state rather than crashing.
 */
export function mapTemplateContent(template: TemplateContentTemplate, type: TemplateType): TemplateContent {
  switch (type) {
    case 'callout':
      return template.callout
        ? mapCalloutContent(template.callout)
        : {
            type: 'callout',
            framingKind: 'none',
            framingTitle: '',
            framingDescription: '',
            allowedContributionTypes: [],
            commentsEnabled: false,
          };
    case 'whiteboard':
      return template.whiteboard
        ? mapWhiteboardContent(template.whiteboard)
        : { type: 'whiteboard', whiteboardContent: '' };
    case 'post':
      return { type: 'post', defaultDescription: template.postDefaultDescription ?? '' };
    case 'space':
      return template.contentSpace
        ? mapSpaceContent(template.contentSpace)
        : { type: 'space', phases: [], starterCallouts: [], subspaceTemplates: [] };
    case 'communityGuidelines':
      return template.communityGuidelines
        ? mapCommunityGuidelinesContent(template.communityGuidelines)
        : { type: 'communityGuidelines', title: '', guidelinesMarkdown: '', references: [] };
  }
}

/** The `include*` query variables for `TemplateContent` for a given CRD template type. */
export function templateContentIncludeVars(type: TemplateType) {
  return {
    includeCallout: type === 'callout',
    includeWhiteboard: type === 'whiteboard',
    includePost: type === 'post',
    includeSpace: type === 'space',
    includeCommunityGuidelines: type === 'communityGuidelines',
  };
}

/**
 * Render-ready `TemplateContent` → editable `TemplateFormValues` (used by Duplicate and "save X as a
 * template"). Returns `null` for `space` (the captured-structure preview doesn't carry the source
 * `contentSpace.id`, which the create-from-content-space mutation needs — caller must supply it) and
 * `callout` (needs the callout-form value shape — T025). `name`/`description`/`tags` come from the caller.
 */
export function templateContentToFormValues(
  content: TemplateContent,
  name: string,
  description = '',
  tags: string[] = []
): TemplateFormValues | null {
  const common = { name, description, tags };
  switch (content.type) {
    case 'post':
      return { ...common, type: 'post', defaultDescription: content.defaultDescription };
    case 'whiteboard':
      return { ...common, type: 'whiteboard', whiteboardContent: content.whiteboardContent };
    case 'communityGuidelines':
      return {
        ...common,
        type: 'communityGuidelines',
        title: content.title,
        guidelinesMarkdown: content.guidelinesMarkdown,
        references: content.references,
      };
    case 'space':
    case 'callout':
      return null;
  }
}
