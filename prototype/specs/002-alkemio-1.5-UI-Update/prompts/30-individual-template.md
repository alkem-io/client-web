# Page 30: Individual Template Detail — Figma Make Prompt

> **Action**: Delta fix — Verified against prototype visual state (code trace, June 2025)
> **Target files**: `src/app/components/template-library/TemplateDetail.tsx`, `src/app/pages/TemplateDetailPage.tsx`

## Context

You are editing an existing React + shadcn/ui prototype of the Alkemio platform. The prototype is built with Vite 6, React 18, shadcn/ui, Tailwind CSS v4, and Lucide React icons.

Design tokens (already correct, do not change):
- Font: Inter (all text)
- Primary: #1D384A
- Border radius: 6px (--radius)
- Page background: white
- Card background: white

**What the prototype currently renders (Individual Template Detail page — 907 lines, most complex page):**
- Header: Breadcrumb (Back / Template Library / [Pack] / Template Name), type badge (color-coded), template name (h1, 3xl), description, author + tag badges, action buttons (Apply This Template, Favorite heart, Share)
- Two-column layout (8/4 grid on desktop):
  - Left (8 cols): Type-switched preview — one of 7+ render functions:
    - SpaceTemplatePreview: gradient header + Home icon + 4 clickable tabs (About, Resources, Subspaces, Templates)
    - SubspaceTemplatePreview: header + vertical numbered stages (1→2→3→4) each listing post items — pipeline/kanban visualization
    - PostTemplatePreview: feed-style post mockup with avatar, author, body
    - CollaborationToolPreview: post mockup + attached component card with mini visual
    - WhiteboardTemplatePreview: 600px canvas with toolbar, dot-grid background, draggable zones
    - CommunityGuidelinesPreview: cards for guideline categories (Code of Conduct, Communication Norms, etc.)
    - BriefTemplatePreview: document-style with section headers and input areas
    - Fallback: title + template fields as empty form inputs
  - Right (4 cols, sticky): MetadataPanel sidebar with:
    - "How to Use This Template" (collapsible, blue highlight) — generic boilerplate HTML (Setup, Brainstorming, Synthesis, Action Items) — rendered from template.instructions field, ~70% of templates have it
    - "About This Template" card: usage count, updated date, complexity badge
    - "What's Included" checklist (varies by type)
    - "Related Templates": up to 3 cards
- Apply Dialog: Select target space → Apply Template

## Changes Required

1. **Simplify the SubspaceTemplatePreview numbered stages.** The prototype renders a vertical pipeline with numbered stages (Stage 1→2→3→4) each containing listed post items. While the structural concept of "a subspace has stages with posts" is correct, the stage names may reference methodology concepts (e.g. "Day 1: Map", "Day 2: Sketch"). Ensure the stage names are generic/structural (e.g. "Stage 1", "Stage 2", "Phase A", "Phase B") rather than methodology-specific. Keep the visual pipeline/numbered layout — just clean the labels.

2. **Simplify the sidebar "How to Use This Template" instructions.** The prototype renders a collapsible instructions panel with generic boilerplate HTML (always the same: Setup → Brainstorming → Synthesis → Action Items, regardless of template type). Replace this with:
   - A shorter, type-specific usage description (2-3 sentences max)
   - OR remove the boilerplate entirely and show instructions only when the template's `instructions` field contains genuinely unique content
   - The current one-size-fits-all boilerplate feels artificial. Better to have no instructions than fake ones.

3. **Verify two-column layout.** Confirm the page uses a 12-column CSS grid with 8-column main preview (left) and 4-column sticky sidebar (right). The sidebar should use `position: sticky` with appropriate `top` value so it sticks when scrolling the preview. Verify responsive behavior: on mobile/tablet, the sidebar should stack below the preview (single column).

4. **Verify breadcrumb and back navigation.** The breadcrumb should show: Back arrow → "Template Library" (link to `/templates`) → Pack name if applicable (link to pack detail) → Template name (current, not linked). Confirm the back arrow and all intermediate links work.

5. **Verify header elements.** Below the breadcrumb: type `Badge` (color-coded per template type), template title (h1, 3xl/bold), description text (lg), author name, tag `Badge` components, and three action buttons:
   - "Apply This Template" (`Button variant="default"`, primary)
   - Favorite/heart toggle (Lucide `Heart`, `Button variant="outline" size="icon"`)
   - Share button (Lucide `Share2`, `Button variant="outline" size="icon"`)
   Confirm all render correctly.

6. **Verify type-specific previews render correctly.** Each of the 7+ preview components should produce a meaningful visual:
   - Space: interactive mockup with tabs
   - Subspace: pipeline/stages layout (with cleaned labels from change #1)
   - Post: feed-style card
   - Collaboration Tool: post + attached component
   - Whiteboard: canvas with toolbar
   - Community Guidelines: category cards
   - Brief: document layout
   Confirm each type renders its preview without errors.

7. **Verify sidebar metadata panel.** Below the instructions (from change #2):
   - "About This Template" card: usage count, updated date, complexity badge (Beginner/Intermediate/Advanced)
   - "What's Included" section: checkmark list describing template contents (varies by type)
   - "Related Templates": up to 3 clickable template cards linking to other templates of the same type
   Confirm all sections render.

8. **Verify "Apply to Space" dialog.** Clicking "Apply This Template" should open a shadcn `Dialog` with a `Select` dropdown to choose a target space (mock options), plus Cancel and Apply buttons. Same pattern as pack detail page. Confirm functional.
