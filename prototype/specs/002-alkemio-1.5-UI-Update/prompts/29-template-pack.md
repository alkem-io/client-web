# Page 29: Template Pack Detail — Figma Make Prompt

> **Action**: Delta fix — Verified against prototype visual state (code trace, June 2025)
> **Target files**: `src/app/components/template-library/TemplatePackDetail.tsx`, `src/app/pages/TemplatePackDetailPage.tsx`

## Context

You are editing an existing React + shadcn/ui prototype of the Alkemio platform. The prototype is built with Vite 6, React 18, shadcn/ui, Tailwind CSS v4, and Lucide React icons.

Design tokens (already correct, do not change):
- Font: Inter (all text)
- Primary: #1D384A
- Border radius: 6px (--radius)
- Page background: white
- Card background: white

**What the prototype currently renders (Template Pack Detail page):**
- Sticky header with breadcrumb: "← Template Library > Design Sprint Kit"
- Pack info: 64×64 thumbnail + title "Design Sprint Kit" + description ("A complete set of tools to run a 5-day Design Sprint...") + metadata ("14 Templates" badge, "by Google Ventures", tags: Innovation, Product, Strategy, Workshop) + Share button + "Apply Entire Pack" button
- Main content: Accordion sections (all open by default) grouped by template type: "Space Templates", "Subspace Templates", "Collaboration Tools", "Whiteboards", "Community Guidelines"
- Each section: grid of TemplateCards with preview thumbnail (h-32), type badge, name, description, "View Details" + "Quick Apply" buttons
- "You might also like" section: 3 placeholder gray boxes ("Related Pack 1/2/3")
- Apply Dialog modal: "Apply Pack/Template" → Select dropdown with mock spaces → Apply/Cancel buttons
- NOTE: There is NO methodology content on this page — template names hint at methodology (Day 1: Map, Day 2: Sketch) but no methodology text/descriptions are rendered

## Changes Required

1. **Replace the "You might also like" placeholder with real related pack cards.** The prototype currently shows 3 gray placeholder boxes labeled "Related Pack 1/2/3". Replace with actual `Card` components that match the PackCard style from the Template Library page: cover image, pack name, template count, clickable to navigate to that pack's detail page. Use 2-3 cards from the same mock data source (`template-data.ts`).

2. **Replace custom pagination (if any) with "Load more".** If any of the accordion sections have pagination for their template grids, replace with a centered `Button variant="outline"` labeled "Load more". Most sections should show all templates directly without pagination given typical pack sizes.

3. **Verify breadcrumb and back navigation.** At the top: "← Template Library" as a clickable `Button variant="link"` or breadcrumb link with a left arrow (Lucide `ArrowLeft` or `ChevronLeft`). This should navigate back to `/templates`. The breadcrumb should also show the current pack name. Confirm present and functional.

4. **Verify pack header layout.** Below the breadcrumb: pack thumbnail (64×64), pack title (large heading), pack description (body text), author attribution ("by Google Ventures"), tag badges (Innovation, Product, Strategy, Workshop), and stats ("14 Templates"). Action buttons: Share (`Button variant="outline"`) and "Apply Entire Pack" (`Button variant="default"`). Confirm all elements render correctly.

5. **Verify template sections use Accordion.** The body should group templates by type using shadcn `Accordion` with `AccordionItem`, `AccordionTrigger`, and `AccordionContent`. Each section header should show the type name and template count. Inside: a responsive grid (1/2/3/4 cols) of TemplateCards. Each card should be clickable → navigate to `/templates/:templateId`. Confirm structure.

6. **Verify "Apply Entire Pack" dialog.** Clicking the button should open a shadcn `Dialog` with:
   - Title: "Apply Pack" or "Apply Entire Pack"
   - A shadcn `Select` dropdown to choose a target space (with mock options)
   - Cancel + Apply buttons
   Confirm present and functional.

7. **Verify individual template "Quick Apply" buttons.** Each TemplateCard in the grid should have both "View Details" (navigates to template detail) and "Quick Apply" (opens the same apply dialog with the specific template pre-selected). Confirm both actions work.
