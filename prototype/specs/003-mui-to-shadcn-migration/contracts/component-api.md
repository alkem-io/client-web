# Contract: shadcn Component Integration API

**Feature**: 003-mui-to-shadcn-migration  
**Date**: 2026-03-23  
**Scope**: How shadcn/ui components are integrated into client-web

---

## 1. Component File Location

All shadcn UI primitives are placed at:
```
client-web/src/core/ui/components/
├── accordion.tsx
├── alert-dialog.tsx
├── alert.tsx
├── avatar.tsx
├── badge.tsx
├── breadcrumb.tsx
├── button.tsx
├── calendar.tsx
├── card.tsx
├── ...                    (47 files total, from prototype)
└── utils.ts               (cn() utility)
```

Source: `prototype/src/app/components/ui/` — copied verbatim, then adapted for `tw-` prefix during coexistence.

---

## 2. Utility Functions

### `cn()` — Class Name Merger

```typescript
// client-web/src/core/ui/utils/cn.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

All components use `cn()` for conditional class composition. This replaces MUI's `sx` prop pattern.

---

## 3. Component API Contracts

### Button

```typescript
// Import
import { Button } from '@/core/ui/components/button';

// Variants (replaces MUI variant prop)
type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
type ButtonSize = "default" | "sm" | "lg" | "icon";

// MUI → shadcn variant mapping
// MUI "contained" → shadcn "default"
// MUI "outlined"  → shadcn "outline"
// MUI "text"      → shadcn "ghost"

// Usage
<Button variant="default" size="default">Label</Button>
<Button variant="ghost" size="icon"><Icon /></Button>  // replaces MUI IconButton
<Button variant="default" className="tw-w-full">Full Width</Button>  // replaces FullWidthButton
<Button disabled>Disabled</Button>
<Button asChild><a href="/link">Link Button</a></Button>  // Radix Slot pattern
```

### Card

```typescript
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/core/ui/components/card';

// Replaces MUI Paper + CardContent + CardActions
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Dialog

```typescript
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter, DialogClose
} from '@/core/ui/components/dialog';

// Key difference from MUI: Radix uses composition, not props
// MUI: <Dialog open={open} onClose={handleClose}>
// shadcn: <Dialog open={open} onOpenChange={setOpen}>

<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    {/* Body */}
    <DialogFooter>
      <DialogClose asChild>
        <Button variant="outline">Cancel</Button>
      </DialogClose>
      <Button onClick={handleSubmit}>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### AlertDialog (replaces ConfirmationDialog)

```typescript
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent,
  AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
  AlertDialogFooter, AlertDialogCancel, AlertDialogAction
} from '@/core/ui/components/alert-dialog';

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Tabs

```typescript
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/core/ui/components/tabs';

// Key difference from MUI: value-based, not index-based
// MUI: <Tabs value={tabIndex} onChange={(_, v) => setTab(v)}>
// shadcn: <Tabs value={tabValue} onValueChange={setTabValue}>

<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="home">Home</TabsTrigger>
    <TabsTrigger value="community">Community</TabsTrigger>
    <TabsTrigger value="subspaces">Subspaces</TabsTrigger>
  </TabsList>
  <TabsContent value="home">{/* Home content */}</TabsContent>
  <TabsContent value="community">{/* Community content */}</TabsContent>
  <TabsContent value="subspaces">{/* Subspaces content */}</TabsContent>
</Tabs>
```

### Input (replaces TextField)

```typescript
import { Input } from '@/core/ui/components/input';
import { Label } from '@/core/ui/components/label';
import { Textarea } from '@/core/ui/components/textarea';

// Key difference from MUI: no built-in label — use Label separately
// MUI: <TextField label="Name" value={v} onChange={handle} helperText="..." error />
// shadcn: Label + Input + error span

<div className="tw-space-y-2">
  <Label htmlFor="name">Name</Label>
  <Input id="name" value={value} onChange={handle} />
  {error && <p className="tw-text-sm tw-text-destructive">{error}</p>}
</div>
```

### Select (replaces MUI Select)

```typescript
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/core/ui/components/select';

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Choose..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

### DropdownMenu (replaces MUI Menu)

```typescript
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator
} from '@/core/ui/components/dropdown-menu';

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon"><MoreVertical /></Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={handleDelete} className="tw-text-destructive">Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Toast (replaces Snackbar)

```typescript
import { toast } from 'sonner';
import { Toaster } from '@/core/ui/components/sonner';

// Add <Toaster /> once in app root
// Then call toast() anywhere:
toast.success('Changes saved');
toast.error('Failed to save');
toast.info('Processing...');
```

### Avatar

```typescript
import { Avatar, AvatarImage, AvatarFallback } from '@/core/ui/components/avatar';

<Avatar>
  <AvatarImage src={user.avatar} alt={user.name} />
  <AvatarFallback>{user.initials}</AvatarFallback>
</Avatar>
```

### Badge (replaces MUI Chip)

```typescript
import { Badge } from '@/core/ui/components/badge';

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

<Badge variant="default">Active</Badge>
<Badge variant="secondary">Draft</Badge>
<Badge variant="destructive">Error</Badge>
```

### Tooltip

```typescript
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/core/ui/components/tooltip';

// Key difference: Radix requires TooltipProvider at app root
// Key difference: Must wrap trigger element — can't just add title prop

<Tooltip>
  <TooltipTrigger asChild>
    <Button variant="ghost" size="icon"><HelpCircle /></Button>
  </TooltipTrigger>
  <TooltipContent>
    <p>Help text here</p>
  </TooltipContent>
</Tooltip>
```

### Skeleton (replaces Loading)

```typescript
import { Skeleton } from '@/core/ui/components/skeleton';

<Skeleton className="tw-h-4 tw-w-[250px]" />    // text line
<Skeleton className="tw-h-12 tw-w-12 tw-rounded-full" />  // avatar
<Skeleton className="tw-h-[200px] tw-w-full" />  // card
```

---

## 4. Import Path Convention

All shadcn components are imported from `@/core/ui/components/`:
```typescript
import { Button } from '@/core/ui/components/button';
import { Card, CardContent } from '@/core/ui/components/card';
import { cn } from '@/core/ui/utils/cn';
```

Domain-specific wrapper components (e.g., `SpaceCard`, `ContributeCard`) remain in their domain directories and compose shadcn primitives internally.

---

## 5. Styling Contract

### Class Application Rules

1. **Tailwind classes** are the primary styling mechanism — no `sx` prop, no `styled()`, no `style` prop (except for dynamic computed values)
2. **`cn()`** is used for all conditional class composition
3. **`tw-` prefix** is used on all Tailwind utility classes during the coexistence period
4. **CSS custom properties** from `theme.css` are used for dynamic theme values
5. **No inline `style` props** except for truly dynamic values (e.g., `style={{ width: `${percentage}%` }}`)

### Example Migration

```tsx
// BEFORE (MUI)
<Box sx={{ padding: gutters(2), display: 'flex', gap: gutters(1), backgroundColor: 'background.paper' }}>
  <Typography variant="h2" color="primary">Title</Typography>
  <Button variant="contained" color="primary" startIcon={<AddIcon />}>Add</Button>
</Box>

// AFTER (shadcn + Tailwind)
<div className="tw-p-5 tw-flex tw-gap-2.5 tw-bg-card">
  <h2 className="tw-text-lg tw-font-bold tw-text-primary">Title</h2>
  <Button><Plus className="tw-mr-2 tw-h-4 tw-w-4" /> Add</Button>
</div>
```
