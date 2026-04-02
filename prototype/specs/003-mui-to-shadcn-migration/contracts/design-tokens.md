# Contract: Design Tokens

**Feature**: 003-mui-to-shadcn-migration  
**Date**: 2026-03-23  
**Scope**: CSS custom property token contract between theme.css and Tailwind/components

---

## 1. Token File Location

```
client-web/styles/theme.css    — CSS custom properties (source of truth)
client-web/styles/tailwind.css — Tailwind entry point with @theme inline bindings
client-web/styles/fonts.css    — Font import (Inter)
```

---

## 2. Token Contract: Required CSS Custom Properties

Any valid theme.css MUST define all of the following variables in `:root`. Components depend on these existing.

### Required Color Tokens

| Token | Type | Description |
|-------|------|-------------|
| `--background` | color | Page background |
| `--foreground` | color | Default text on background |
| `--card` | color | Card/container background |
| `--card-foreground` | color | Text on cards |
| `--popover` | color | Popover/dropdown background |
| `--popover-foreground` | color | Text on popovers |
| `--primary` | color | Primary interactive elements |
| `--primary-foreground` | color | Text on primary elements |
| `--secondary` | color | Secondary interactive elements |
| `--secondary-foreground` | color | Text on secondary elements |
| `--muted` | color | Subdued/disabled backgrounds |
| `--muted-foreground` | color | Subdued text |
| `--accent` | color | Accent/highlight backgrounds |
| `--accent-foreground` | color | Text on accent backgrounds |
| `--destructive` | color | Destructive action backgrounds |
| `--destructive-foreground` | color | Text on destructive elements |
| `--border` | color | Default border color |
| `--input` | color | Input field border/color |
| `--input-background` | color | Input field background |
| `--ring` | color | Focus ring color |

### Required Status Tokens

| Token | Type | Description |
|-------|------|-------------|
| `--success` | color | Success state |
| `--success-foreground` | color | Text on success |
| `--warning` | color | Warning state |
| `--warning-foreground` | color | Text on warning |
| `--info` | color | Info state |
| `--info-foreground` | color | Text on info |

### Required Layout Tokens

| Token | Type | Description |
|-------|------|-------------|
| `--radius` | length | Base border radius (6px) |
| `--elevation-sm` | shadow | Small elevation shadow |

### Required Typography Tokens

| Token | Type | Description |
|-------|------|-------------|
| `--font-size` | length | Base font size (16px) |
| `--font-weight-normal` | number | Normal weight (400) |
| `--font-weight-medium` | number | Medium weight (500) |

### Required Sidebar Tokens

| Token | Type | Description |
|-------|------|-------------|
| `--sidebar` | color | Sidebar background |
| `--sidebar-foreground` | color | Sidebar text |
| `--sidebar-primary` | color | Sidebar primary elements |
| `--sidebar-primary-foreground` | color | Text on sidebar primary |
| `--sidebar-accent` | color | Sidebar accent/hover |
| `--sidebar-accent-foreground` | color | Text on sidebar accent |
| `--sidebar-border` | color | Sidebar borders |
| `--sidebar-ring` | color | Sidebar focus rings |

---

## 3. Tailwind Binding Contract

The `tailwind.css` file binds CSS custom properties to Tailwind utilities via `@theme inline`:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-input-background: var(--input-background);
  --color-ring: var(--ring);
  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
  --color-info: var(--info);
  --color-info-foreground: var(--info-foreground);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}
```

This ensures that Tailwind utilities like `tw-bg-primary`, `tw-text-muted-foreground`, `tw-rounded-lg` resolve to the CSS custom properties defined in theme.css.

---

## 4. MUI Theme → CSS Variable Mapping

Reference for developers migrating from MUI theme access patterns:

| MUI Access Pattern | CSS Custom Property | Tailwind Utility |
|-------------------|--------------------|-----------------| 
| `theme.palette.primary.main` | `var(--primary)` | `tw-bg-primary` / `tw-text-primary` |
| `theme.palette.primary.contrastText` | `var(--primary-foreground)` | `tw-text-primary-foreground` |
| `theme.palette.secondary.main` | `var(--secondary)` | `tw-bg-secondary` |
| `theme.palette.error.main` | `var(--destructive)` | `tw-bg-destructive` |
| `theme.palette.success.main` | `var(--success)` | `tw-bg-success` |
| `theme.palette.warning.main` | `var(--warning)` | `tw-bg-warning` |
| `theme.palette.info.main` | `var(--info)` | `tw-bg-info` |
| `theme.palette.background.default` | `var(--background)` | `tw-bg-background` |
| `theme.palette.background.paper` | `var(--card)` | `tw-bg-card` |
| `theme.palette.text.primary` | `var(--foreground)` | `tw-text-foreground` |
| `theme.palette.text.secondary` | `var(--muted-foreground)` | `tw-text-muted-foreground` |
| `theme.palette.divider` | `var(--border)` | `tw-border-border` |
| `theme.shape.borderRadius` | `var(--radius)` | `tw-rounded-lg` |
| `theme.spacing(n)` | N/A — use Tailwind scale | `tw-p-{n}`, `tw-m-{n}`, `tw-gap-{n}` |

---

## 5. Inverted Theme Contract

For sections requiring inverted colors (replaces `SwapColors`/nested `ThemeProvider`):

```css
/* In theme.css */
.inverted-theme {
  --background: rgba(29, 56, 74, 1.00);    /* primary → background */
  --foreground: rgba(255, 255, 255, 1.00);  /* primary-foreground → foreground */
  --card: rgba(29, 56, 74, 1.00);
  --card-foreground: rgba(255, 255, 255, 1.00);
  --muted: rgba(51, 65, 85, 1.00);
  --muted-foreground: rgba(203, 213, 225, 1.00);
  --border: rgba(51, 65, 85, 1.00);
}
```

Usage: `<div className="inverted-theme">...</div>` — all descendant components automatically pick up inverted tokens.

---

## 6. Backward Compatibility

During the coexistence phase:
- MUI's `ThemeProvider` and `createTheme` remain active for unmigrated components
- CSS custom properties in `theme.css` match the same color values as MUI's palette.ts
- A component can use either system — but not both simultaneously
- The `tw-` prefix prevents any class name collision between Emotion and Tailwind
