# Contract: `CrdNotFoundPage` (presentational)

**Location**: `src/crd/components/error/CrdNotFoundPage.tsx`
**Layer**: CRD presentational (props-only). No MUI, no business logic, no GraphQL types, no router imports.

## Props

```ts
export type CrdNotFoundPageProps = {
  title: string;
  description: string;
  goHomeLabel: string;
  goBackLabel: string;
  onGoHome: () => void;
  onGoBack?: () => void;
  showGoBack?: boolean;
  search?: ReactNode;     // optional slot; unused in P1 (FR-014a)
  className?: string;
};
```

## Rendering contract

- Outer container: `flex min-h-[60vh] w-full items-center justify-center px-4 py-12` (matches `CrdForbiddenPage`), `className` merged via `cn()`.
- Card: `flex w-full max-w-md flex-col items-center gap-6 rounded-lg border bg-card p-8 text-center shadow-sm`.
- Icon: `lucide-react` `FileQuestion`, `aria-hidden="true"`, `size-12 text-muted-foreground`.
- Heading: `<h1 className="text-page-title text-foreground">{title}</h1>`.
- Body: `<p className="text-body text-muted-foreground">{description}</p>`.
- Optional `search` slot rendered between body and actions, only when `search` is provided.
- Actions block: primary `<Button autoFocus type="button" onClick={onGoHome}>{goHomeLabel}</Button>`; secondary `<Button variant="secondary" type="button" onClick={onGoBack}>{goBackLabel}</Button>` rendered only when `showGoBack === true && onGoBack !== undefined`.

## Behavioural guarantees

- BG-1: Renders without crashing given only the required props.
- BG-2: "Go back" button is absent when `showGoBack` is falsy OR `onGoBack` is undefined.
- BG-3: Clicking primary calls `onGoHome`; clicking secondary calls `onGoBack`.
- BG-4: No network, navigation, logging, or localStorage access happens inside this component (all via props / handled by the integration wrapper).
- BG-5: Accessibility — exactly one `<h1>`; icon is decorative (`aria-hidden`); both actions are real `<button>`s.

## Test contract (`CrdNotFoundPage.test.tsx`)

1. renders title and description.
2. renders "go home" button and fires `onGoHome` on click.
3. hides "go back" when `showGoBack` false or `onGoBack` undefined.
4. shows "go back" and fires `onGoBack` when `showGoBack` true and `onGoBack` provided.
5. renders `search` slot when provided; omits it otherwise.
