/**
 * Contract: template content preview (read-only).
 *
 * CRD components:
 *  - `src/crd/components/templates/TemplateContentPreview.tsx` — dispatcher by `type`
 *  - `src/crd/components/templates/preview/{Callout,Whiteboard,Post,Space,CommunityGuidelines}TemplatePreview.tsx`
 *  - `src/crd/components/templates/TemplatePreviewDialog.tsx` — wraps the above in a CRD dialog + optional Edit affordance
 *
 * Used by: the preview dialog (holder list, library, pack profile), the picker's preview pane, and any
 * "template detail" surface. Content is the fully-loaded, render-ready shape produced by
 * `templateContentMapper.ts` from the lazy `TemplateContent` GraphQL query.
 *
 * NOTE: every `*Markdown` / markdown-bearing string MUST be rendered via `MarkdownContent` /
 * `InlineMarkdown` — never as plain text (src/crd/CLAUDE.md Rule 10).
 */

import type { TemplateCardData } from './templates-manager';

export type FramingKind = 'text' | 'whiteboard' | 'memo' | 'link' | 'mediaGallery';

export type TemplateContent =
  | {
      type: 'callout';
      framingKind: FramingKind;
      framingTitle: string;
      /** markdown */
      framingDescription: string;
      /** Excalidraw JSON — when framingKind === 'whiteboard' */
      framingWhiteboardContent?: string;
      /** markdown — when framingKind === 'memo' */
      framingMemoContent?: string;
      /** when framingKind === 'link' */
      framingLinks?: { name: string; uri: string }[];
      /** when framingKind === 'mediaGallery' */
      framingMediaImages?: { uri: string; alt?: string }[];
      allowedContributionTypes: ('post' | 'whiteboard' | 'link')[];
      commentsEnabled: boolean;
      /** markdown */
      defaultPostDescription?: string;
      /** Excalidraw JSON */
      defaultWhiteboardContent?: string;
    }
  | {
      type: 'whiteboard';
      /** Excalidraw JSON */
      whiteboardContent: string;
      previewImageUrl?: string;
    }
  | {
      type: 'post';
      /** markdown */
      defaultDescription: string;
    }
  | {
      type: 'space';
      /** innovation-flow states */
      phases: { name: string; description?: string }[];
      starterCallouts: { name: string; framingKind: FramingKind }[];
      subspaceTemplates: { name: string }[];
    }
  | {
      type: 'communityGuidelines';
      /** markdown */
      guidelinesMarkdown: string;
      references: { id: string; name: string; uri: string; description?: string }[];
    };

export type TemplateContentPreviewProps = {
  content: TemplateContent;
  /** Loading skeleton while the lazy content query resolves (role="status" + aria-label). */
  loading?: boolean;
  className?: string;
};

export type TemplatePreviewDialogProps = {
  open: boolean;
  onClose: () => void;
  /** Header info (name, type, banner) — available before the heavy content loads. */
  header: TemplateCardData;
  content?: TemplateContent;
  contentLoading: boolean;
  /** Shown only when the viewer may edit this template. */
  onEdit?: () => void;
};
