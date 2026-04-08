# Research Summary

## Decisions
- **Primary sources**: 
  - Live site (https://alkem.io) for current UI/UX and navigation structure
  - Documentation (https://alkem.io/docs) for features and platform capabilities
  - In-repo personas (specs/001-alkemio-design-brief/personas/*.md) for user context
- **Screenshot plan**: Capture screenshots directly from live alkem.io site during sitemap/page discovery; prioritize home, dashboard, and main navigation pages first.
- **Figma scope**: Reference existing Figma files as visual snapshots only (note: files are plugin-generated with auto-layered structure, so metadata extraction unreliable); primary value is visual reference for existing design patterns.
- **Brief outputs**: Master design brief (platform-wide) plus page-specific briefs structured for Figma AI prompts.

## Rationale
- Live site is the authoritative source for current UX/IA; Figma files are generated snapshots, not design system truth.
- Documentation + live site together define features and their current placement.
- Screenshots from live site provide visual context for redesign briefs without requiring Figma metadata extraction.
- Figma files remain useful as visual references but should not be treated as structural/metadata sources.

## Alternatives Considered
- **Extract Figma metadata as primary source**: Rejected; plugin-generated layer structure does not encode useful design system information; live site is more reliable.
- **Bulk screenshot sweep first**: Rejected to avoid capturing unused/low-priority pages; iterative capture during discovery is leaner.
- **Single master brief only**: Rejected; page-level briefs are required to drive focused Figma outputs.

## Open Items
- Document complete sitemap from live alkem.io navigation.
- Capture screenshots of each main page during discovery (home, dashboard, navigation paths first).
- Note any role-restricted pages or access limitations encountered on live site.
- Reference Figma files as visual snapshots in design brief (optional) but rely on live site + docs for feature/structure truth.
