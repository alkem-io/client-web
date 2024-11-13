### SVG / icons organization in the codebase

The project is using the MUI Icons.
However, we have cusom SVG icons as well.

The prefered way of adding an SVGs is:

- Create a tsx file in `main/ui/icons` (see any of the exisitng ones for reference).
  That way we can pass props like `fill` or `stroke` to the svg, we can lazyLoad it, etc.
