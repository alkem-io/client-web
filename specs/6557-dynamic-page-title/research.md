# Research: Dynamic Page Title in Browser Tabs

**Feature**: 6557-dynamic-page-title
**Date**: 2026-01-22

## Research Tasks

### R-001: React Page Title Management Patterns

**Question**: What is the best approach for managing page titles in a React 19 SPA?

**Findings**:

1. **Native `document.title` with useEffect**
   - Simplest approach: `useEffect(() => { document.title = title; }, [title])`
   - No external dependencies
   - React 19 compatible (side effect properly isolated)
   - Used by many production apps

2. **react-helmet-async**
   - Popular library for managing `<head>` elements
   - Adds ~10KB to bundle
   - Provides more features than needed (meta tags, scripts, etc.)
   - Overkill for title-only use case

3. **React 19 Document Metadata (Canary)**
   - React 19 added experimental `<title>` component support for RSC
   - Not stable for client components
   - Alkemio is not using RSC yet

**Decision**: Custom `usePageTitle` hook using `useEffect`

**Rationale**:

- Minimal bundle impact (zero new dependencies)
- Aligns with Constitution's preference for avoiding unnecessary libraries
- Follows React 19 concurrent mode patterns
- Easy to test and maintain

---

### R-002: Title Format Best Practices

**Question**: What format should page titles follow for optimal UX and SEO?

**Findings**:

1. **Industry Standards**:
   - Google: "Page Name - Google"
   - GitHub: "repo/file at branch · user/repo · GitHub"
   - Notion: "Page Name | Notion"
   - Slack: "Channel - Workspace"

2. **Separator Options**:
   - Pipe `|`: Clean, modern (GitHub, Notion)
   - Dash `-`: Traditional (Google, many sites)
   - Colon `:`: Less common
   - Bullet `·`: Trendy but harder to type

3. **Brand Position**:
   - Suffix (end): "Page Name | Brand" - Most common
   - Prefix (start): "Brand | Page Name" - Less common

**Decision**: Use `"[Page Context] | Alkemio"` format

**Rationale**:

- Pipe separator is clean and modern
- Page context first helps users identify tabs quickly
- Brand at end reinforces identity without cluttering
- Matches user expectation from issue description

---

### R-003: Internationalization Strategy

**Question**: How should page titles handle i18n?

**Findings**:

1. **Static titles** (Forum, Contributors, etc.):
   - Should be translated
   - Use existing `react-i18next` infrastructure
   - Add keys under `pages.titles.*`

2. **Dynamic titles** (Space names, User names):
   - User-generated content
   - Should NOT be translated
   - Pass raw entity name to hook

3. **Brand suffix** ("Alkemio"):
   - Could be translated for localized branding
   - Current practice: Keep as "Alkemio" in all locales
   - Decision: Keep untranslated for brand consistency

**Decision**: Static titles via i18n keys; dynamic titles as raw strings; "Alkemio" suffix untranslated

**Rationale**:

- Consistent with existing i18n patterns in codebase
- Entity names are user content, not translatable
- Brand name should remain consistent globally

---

### R-004: Loading State Handling

**Question**: What should the title show during data loading?

**Findings**:

1. **Options**:
   - Show "Loading..." - Feels incomplete
   - Show empty - Bad UX
   - Show just "Alkemio" - Clean fallback
   - Show previous title - Could be confusing across navigations

2. **Current behavior**:
   - Static title in `index.html`: "Alkemio - Safe Spaces for Collaboration"
   - Persists until explicitly changed

**Decision**: Default to "Alkemio" during loading/undefined states

**Rationale**:

- Clean and professional appearance
- Consistent with home page title
- Clear indication of brand while loading
- Better than flashing incomplete titles

---

### R-005: Existing Codebase Patterns

**Question**: How do similar cross-cutting concerns work in Alkemio?

**Findings**:

1. **Analytics hooks**: Located in `src/core/analytics/`
2. **Routing utilities**: Located in `src/core/routing/`
3. **Layout components**: Pattern of using `useEffect` for side effects
4. **Context pattern**: `useSpace()`, `useSubSpace()` provide entity data

**Decision**: Place `usePageTitle` in `src/core/routing/`

**Rationale**:

- Title is tied to navigation/routing
- Follows existing organizational patterns
- Cross-cutting concern belongs in `src/core`

---

## Summary

| Decision       | Choice                           | Key Rationale                  |
| -------------- | -------------------------------- | ------------------------------ | ----------------------------- |
| Implementation | Custom `usePageTitle` hook       | Zero deps, React 19 compatible |
| Format         | `[Context]                       | Alkemio`                       | Industry standard, page-first |
| i18n           | Keys for static, raw for dynamic | Matches content type           |
| Fallback       | "Alkemio"                        | Clean, consistent              |
| Location       | `src/core/routing/`              | Follows codebase patterns      |

All research questions resolved. No outstanding clarifications needed.
