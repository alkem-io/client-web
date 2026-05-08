# Conceptual Data Model for Design Brief

## Entities
- **PlatformOverview**: mission, core purpose, value proposition, differentiators.
- **Sitemap**: list of pages with hierarchy (parent/child), navigation labels, access roles.
- **PageInventoryItem**: page name, purpose, primary features, secondary features, current layout summary, key interactions, linked personas, source references (docs, screenshot, Figma).
- **Persona**: name, role summary, goals, JTBD, pain points, membership/role metadata.
- **MasterDesignBrief**: synthesized context for the whole platform (overview, principles, IA, patterns, visual/interaction themes).
- **PageDesignBrief**: page-specific brief combining master context with page inventory details and targeted prompt guidance for Figma AI.
- **AssetReference**: screenshot or Figma reference with page mapping and notes.

## Relationships
- PlatformOverview informs MasterDesignBrief.
- Sitemap contains PageInventoryItem entries.
- PageInventoryItem links to one or more Persona entries.
- PageDesignBrief references a PageInventoryItem and inherits constraints/themes from MasterDesignBrief.
- AssetReference links to PageInventoryItem (and optionally Persona relevance).

## Notes
- This model is documentation-focused; no runtime data storage is planned.
- Keep traceability from every brief back to sources (docs, screenshot, Figma) to support verification.
