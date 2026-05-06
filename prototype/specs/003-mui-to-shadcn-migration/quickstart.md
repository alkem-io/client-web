# Quickstart: MUI to shadcn/ui Migration

**Feature**: 003-mui-to-shadcn-migration  
**Date**: 2026-03-23  
**Audience**: Developers working on the migration

---

## Prerequisites

- Node.js 24+
- pnpm (package manager)
- The repository cloned with both `client-web/` and `prototype/` directories
- Familiarity with React, TypeScript, and either MUI or Tailwind CSS

---

## 1. Understanding the Architecture

### What stays the same
- GraphQL queries/mutations (Apollo Client)
- React Router v7 routes
- react-i18next translations
- TipTap rich text editor
- @dnd-kit drag-and-drop
- Excalidraw whiteboards
- Authentication (Ory Kratos)
- Sentry error tracking

### What changes
| Layer | Before | After |
|-------|--------|-------|
| Components | MUI v7 | shadcn/ui (Radix primitives) |
| Styling | Emotion `sx` / `styled()` | Tailwind CSS v4 utilities |
| Spacing | `gutters(n)` → n×10px | Tailwind `tw-p-{n}` |
| Typography | MUI `Typography` + custom wrappers | Tailwind text classes + same named wrappers |
| Theme | MUI `createTheme()` + `ThemeProvider` | CSS custom properties (`theme.css`) |
| Icons | `@mui/icons-material` | Lucide React |
| Forms | Formik + Yup | React Hook Form + Zod |
| Data Grid | `@mui/x-data-grid` | TanStack Table + shadcn Table |
| Toasts | MUI Snackbar | Sonner |

---

## 2. Key Directories

```
client-web/
├── src/core/ui/components/    ← shadcn primitives go here (copied from prototype)
├── src/core/ui/utils/cn.ts    ← cn() utility (class merging)
├── styles/tailwind.css        ← Tailwind CSS entry point (with tw- prefix)
├── styles/theme.css           ← Design tokens (CSS custom properties)
├── styles/fonts.css           ← Inter font import
└── vite.config.mjs            ← Add @tailwindcss/vite plugin

prototype/
├── src/app/components/ui/     ← Source of truth for shadcn components
├── src/app/pages/             ← Visual reference for page layouts
└── src/styles/theme.css       ← Source of truth for design tokens
```

---

## 3. Migrating a Component (Step-by-Step)

### Example: Migrating a Button

**Step 1**: Find the MUI usage
```tsx
// Before
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';

<Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleCreate}>
  {t('common.create')}
</Button>
```

**Step 2**: Replace with shadcn + Lucide
```tsx
// After
import { Button } from '@/core/ui/components/button';
import { Plus } from 'lucide-react';

<Button onClick={handleCreate}>
  <Plus className="tw-mr-2 tw-h-4 tw-w-4" />
  {t('common.create')}
</Button>
```

**Key differences**:
- `variant="contained"` → no variant needed (default)
- `variant="outlined"` → `variant="outline"`
- `variant="text"` → `variant="ghost"`
- `startIcon={<Icon />}` → Icon as child with margin class
- `color="primary"` → default (primary is the default)
- `color="error"` → `variant="destructive"`

### Example: Migrating a Dialog

**Step 1**: Find the MUI usage
```tsx
// Before
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

<Dialog open={isOpen} onClose={handleClose}>
  <DialogTitle>{t('title')}</DialogTitle>
  <DialogContent>{children}</DialogContent>
  <DialogActions>
    <Button onClick={handleClose}>{t('common.cancel')}</Button>
    <Button variant="contained" onClick={handleSave}>{t('common.save')}</Button>
  </DialogActions>
</Dialog>
```

**Step 2**: Replace with shadcn
```tsx
// After
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter
} from '@/core/ui/components/dialog';
import { Button } from '@/core/ui/components/button';

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>{t('title')}</DialogTitle>
    </DialogHeader>
    {children}
    <DialogFooter>
      <Button variant="outline" onClick={handleClose}>{t('common.cancel')}</Button>
      <Button onClick={handleSave}>{t('common.save')}</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Key differences**:
- `onClose` → `onOpenChange` (receives boolean)
- `DialogActions` → `DialogFooter`
- Dialog is closed via `onOpenChange(false)` or the built-in X button

---

## 4. Spacing Quick Reference

| Old | New | Pixels |
|-----|-----|--------|
| `gutters(0.5)` | `tw-p-1.5` | ~6px |
| `gutters(1)` | `tw-p-2.5` | 10px |
| `gutters(1.5)` | `tw-p-4` | 16px |
| `gutters(2)` | `tw-p-5` | 20px |
| `gutters(3)` | `tw-p-8` | 32px |
| `gutters(4)` | `tw-p-10` | 40px |
| `sx={{ gap: 1 }}` (MUI 8px) | `tw-gap-2` | 8px |
| `sx={{ gap: 2 }}` (MUI 16px) | `tw-gap-4` | 16px |

---

## 5. `sx` Prop Quick Reference

| MUI `sx` | Tailwind |
|----------|----------|
| `display: 'flex'` | `tw-flex` |
| `flexDirection: 'column'` | `tw-flex-col` |
| `alignItems: 'center'` | `tw-items-center` |
| `justifyContent: 'space-between'` | `tw-justify-between` |
| `gap: gutters(1)` | `tw-gap-2.5` |
| `padding: gutters(2)` | `tw-p-5` |
| `margin: 'auto'` | `tw-m-auto` |
| `width: '100%'` | `tw-w-full` |
| `maxWidth: 'md'` | `tw-max-w-md` |
| `backgroundColor: 'primary.main'` | `tw-bg-primary` |
| `color: 'text.secondary'` | `tw-text-muted-foreground` |
| `borderRadius: 1` | `tw-rounded` |
| `overflow: 'hidden'` | `tw-overflow-hidden` |
| `position: 'relative'` | `tw-relative` |
| `cursor: 'pointer'` | `tw-cursor-pointer` |
| `opacity: 0.7` | `tw-opacity-70` |
| `textAlign: 'center'` | `tw-text-center` |

---

## 6. Icon Quick Reference

| MUI Icon | Lucide Import |
|----------|--------------|
| `Close` | `X` |
| `Add` | `Plus` |
| `Edit` | `Pencil` |
| `Delete` | `Trash2` |
| `Search` | `Search` |
| `Settings` | `Settings` |
| `MoreVert` | `MoreVertical` |
| `ExpandMore` | `ChevronDown` |
| `ArrowBack` | `ArrowLeft` |
| `Help` / `HelpOutline` | `HelpCircle` |
| `Visibility` | `Eye` |
| `VisibilityOff` | `EyeOff` |
| `ContentCopy` | `Copy` |
| `Send` | `Send` |
| `Download` | `Download` |

All Lucide icons accept `className` for sizing: `<Icon className="tw-h-4 tw-w-4" />`

---

## 7. Running the Project

```bash
cd client-web
pnpm install
pnpm start        # Dev server at localhost:3001
```

To view the prototype for reference:
```bash
cd prototype
pnpm install
pnpm dev           # Dev server (check terminal for port)
```

---

## 8. Verification Checklist (Per Component)

After migrating a component or page:

- [ ] Visual output matches the prototype reference
- [ ] All interactive states work (hover, focus, active, disabled)
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Screen reader announcements are correct (ARIA attributes)
- [ ] i18n text renders correctly (no hardcoded strings)
- [ ] TypeScript compiles without errors
- [ ] Existing tests pass (or are updated for new component structure)
- [ ] No MUI imports remain in the migrated file
- [ ] No `sx` props remain in the migrated file
- [ ] No `styled()` calls remain in the migrated file

---

## 9. Common Gotchas

1. **Radix Tooltip requires a Provider**: Add `<TooltipProvider>` near the app root
2. **Dialog `onClose` vs `onOpenChange`**: shadcn Dialog calls `onOpenChange(false)` — the handler receives a boolean, not an event
3. **No `startIcon`/`endIcon` on Button**: Place icons as children with margin classes
4. **Chip `onDelete` → Badge has no delete**: Create a custom `RemovableBadge` wrapper
5. **`sx` responsive syntax** `{ xs: 12, md: 6 }` → Tailwind responsive: `tw-w-full md:tw-w-1/2`
6. **MUI Grid item**: `<Grid item xs={6}>` → `<div className="tw-col-span-6">` inside a CSS Grid
7. **Formik `enableReinitialize`**: RHF uses `form.reset(newValues)` in a `useEffect`
8. **The `tw-` prefix**: All Tailwind utilities must be prefixed during coexistence. After MUI removal, the prefix is stripped globally.
