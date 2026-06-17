### SVG / icons organization in the codebase

The not-yet-migrated MUI app uses MUI Icons (`@mui/icons-material`), which is
legacy and frozen alongside the rest of MUI (being removed per epic #1888). **New
CRD code uses `lucide-react` icons, not MUI Icons.** We also have custom SVG icons.

The prefered way of adding an SVGs is:

- Create a tsx file in `main/ui/icons` (see any of the exisitng ones for reference).
  That way we can pass props like `fill` or `stroke` to the svg, we can lazyLoad it, etc.
