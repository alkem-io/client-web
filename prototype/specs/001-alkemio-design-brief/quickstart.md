# Quickstart: Producing Design Briefs for Alkemio Redesign

## Feature-Specific Design Briefs

These feature briefs are maintained as separate files in this folder:
- `design-brief-ecosystem-analytics.md` — Ecosystem Analytics (network graph prototype)
- `messaging-briefs/` — Messaging System design options (5 variants):
  - `brief-1-side-panel.md` — Full messaging system + Space Channel as side panel overlay
  - `brief-2-persistent-drawer.md` — Full messaging system + Space Channel as persistent resizable drawer
  - `brief-3-full-tab.md` — Full messaging system + Space Channel as full tab
  - `brief-4-floating-widget.md` — Full messaging system + Space Channel as floating collapsible widget
  - `brief-5-space-channel-only.md` — Space Channel only (no DMs, no Groups, no Hub)

1) **Gather sources**
   - Personas: already in `specs/001-alkemio-design-brief/personas/`.
   - Docs: https://alkem.io/docs.
   - Figma: collect available files/links for select pages/features.
   - Screenshots: capture on-demand during sitemap walkthrough (home, dashboard, main navigation first).

2) **Document information architecture**
   - Build the sitemap with parent/child hierarchy and access notes.
   - Create page inventory entries: purpose, primary/secondary features, layout summary, key interactions, sources (doc/screenshot/figma), persona links.

3) **Synthesize briefs**
   - Master brief: platform overview, IA summary, personas, core patterns/themes, constraints for Figma AI.
   - Page briefs: one per main page, referencing the master brief + page inventory specifics; include prioritized features and interaction notes.

4) **Validate against success criteria**
   - Coverage: 100% of main navigation pages documented (SC-001).
   - Feature completeness per page (SC-002, SC-003).
   - Persona mapping and clarity (SC-004, SC-005).
   - Consistency across briefs and readiness for Figma AI (SC-006–SC-010).

5) **Update and iterate**
   - Keep briefs version-controlled in `specs/001-alkemio-design-brief/`.
   - Update when platform changes; target <2 hours for refresh (SC-009).
