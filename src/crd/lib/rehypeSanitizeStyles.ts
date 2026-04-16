import type { Element, Root } from 'hast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

/**
 * Whitelist of CSS properties considered safe for user-provided HTML in markdown.
 *
 * Covers the common responsive-embed pattern (position + padding-bottom + absolute children)
 * and basic layout/visual properties. Anything not listed is stripped.
 */
const SAFE_CSS_PROPERTIES = new Set([
  // Positioning
  'position',
  'top',
  'right',
  'bottom',
  'left',
  'z-index',
  // Sizing
  'width',
  'height',
  'min-width',
  'min-height',
  'max-width',
  'max-height',
  'aspect-ratio',
  // Spacing
  'margin',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  // Display & layout
  'display',
  'overflow',
  'overflow-x',
  'overflow-y',
  'float',
  'clear',
  'box-sizing',
  'vertical-align',
  // Flex
  'flex',
  'flex-direction',
  'flex-wrap',
  'align-items',
  'justify-content',
  'gap',
  // Border
  'border',
  'border-top',
  'border-right',
  'border-bottom',
  'border-left',
  'border-width',
  'border-style',
  'border-color',
  'border-radius',
  // Color & background (values are checked for url() separately)
  'color',
  'background-color',
  'background',
  'opacity',
  'color-scheme',
  // Text
  'text-align',
  'font-size',
  'font-weight',
  'font-style',
  'line-height',
  'white-space',
  'word-break',
  'text-decoration',
]);

/**
 * Patterns that indicate dangerous CSS values — rejected regardless of property.
 *
 * - url()          → can load external resources
 * - expression()   → IE CSS expressions (script execution)
 * - javascript:    → script URI in older engines
 * - @import        → load external stylesheets
 * - -moz-binding   → Firefox XBL (script execution)
 * - behavior       → IE DHTML behaviors (script execution)
 */
const DANGEROUS_VALUE_PATTERN = /url\s*\(|expression\s*\(|javascript\s*:|@import|-moz-binding|behavior\s*:/i;

function sanitizeCss(styleString: string): string | undefined {
  const declarations = styleString.split(';');
  const safe: string[] = [];

  for (const decl of declarations) {
    const trimmed = decl.trim();
    if (!trimmed) continue;

    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) continue;

    const property = trimmed.slice(0, colonIndex).trim().toLowerCase();
    const value = trimmed.slice(colonIndex + 1).trim();

    if (!SAFE_CSS_PROPERTIES.has(property)) continue;
    if (DANGEROUS_VALUE_PATTERN.test(value)) continue;

    safe.push(`${property}: ${value}`);
  }

  return safe.length > 0 ? safe.join('; ') : undefined;
}

/**
 * Rehype plugin that sanitizes inline `style` attributes.
 *
 * Must run AFTER `rehype-sanitize` (which allows the `style` attribute through
 * via the custom schema) and strips any CSS property not in the safe list.
 * Values containing dangerous patterns (url(), expression(), etc.) are rejected
 * regardless of property name.
 */
export const rehypeSanitizeStyles: Plugin<[], Root> = () => {
  return tree => {
    visit(tree, 'element', (node: Element) => {
      const style = node.properties?.style;
      if (typeof style !== 'string') return;

      const sanitized = sanitizeCss(style);
      if (sanitized) {
        node.properties.style = sanitized;
      } else {
        delete node.properties.style;
      }
    });
  };
};
