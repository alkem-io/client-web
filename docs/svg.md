### SVG / icons organization in the codebase

**CRD code uses `lucide-react` icons.** MUI Icons (`@mui/icons-material`) were
removed along with the rest of MUI (epic #1888, story #9885) — never reintroduce
them. We also have custom SVG icons.

The prefered way of adding an SVGs is:

- Create a tsx file in `main/ui/icons` (see any of the exisitng ones for reference).
  That way we can pass props like `fill` or `stroke` to the svg, we can lazyLoad it, etc.
