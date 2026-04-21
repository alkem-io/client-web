## Summary

### The problem

Text styling across our new UI is inconsistent. The same kind of text — say, a card title or a page heading — looks slightly different depending on which part of the app you're in. This happens because there's no shared rulebook; each developer picks font sizes and weights by eye, and over time those choices drift apart. An audit of 50+ files confirmed the issue: page titles range from medium to extra-large, card titles use at least two different size/weight combos, and small helper text (timestamps, labels, badges) is scattered across four or five slightly different sizes.

### The solution

We're creating a **typography scale** — a fixed set of 9 named text styles that cover every role text plays in the UI:

| Style name | What it's for | Size | Weight |
|------------|---------------|------|--------|
| **Page Title** | Top-level page headings (e.g., "Explore Spaces") | 30px | Bold |
| **Section Title** | Major sections within a page | 20px | Bold |
| **Subsection Title** | Smaller headings, dialog titles, prominent card titles | 18px | Semi-bold |
| **Card Title** | Compact card headings, list item titles | 14px | Semi-bold |
| **Body** | Regular paragraph text and descriptions | 14px | Normal |
| **Body Emphasis** | Slightly bolder body text, inline links | 14px | Medium |
| **Caption** | Timestamps, metadata, secondary info | 12px | Normal |
| **Label** | Uppercase section headers in sidebars and toolbars | 11px | Semi-bold, spaced-out letters |
| **Badge** | Tag labels, status indicators | 10px | Medium |

Each style bundles not just the font size but also the weight (how bold it is), line spacing, and letter spacing — so applying a style gives you the complete look in one step, rather than mixing and matching individual properties.

### How it works in practice

Instead of developers writing something like "14 pixels, semi-bold, tight line spacing" every time they create a card title (and occasionally getting it slightly wrong), they now just write `text-card-title`. That single name pulls in all the right values. If the design team later decides card titles should be 15px instead of 14px, we change it in one place and it updates everywhere automatically.

These named styles work with Tailwind (the CSS framework the new UI is built on), so they can be combined with other styling — for example, making a caption red for an error, or making a title larger on wide screens.

### Intentional exceptions

The Space header (the large hero banner at the top of a Space page) uses a fluid font size that scales smoothly between 28px and 48px depending on screen width. This is a unique design treatment that doesn't fit into a fixed scale, so it stays as a one-off — it's the only place in the app that does this for now.

### How we'll roll it out

1. **Phase 1** — Define the styles in the codebase (no visual changes yet, nothing breaks).
2. **Phase 2** — Go through each component and swap the old ad-hoc values for the new named styles. Each swap is a small, low-risk change — the text ends up looking the same or more consistent, with no behavior changes.

The migration touches 50+ files, but each individual change is straightforward. The end result is a UI where the same kind of text always looks the same, and future design updates to the type scale propagate instantly across the entire app.

