import { readFileSync } from 'node:fs';
import path from 'node:path';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Settings } from 'lucide-react';
import { describe, expect, test, vi } from 'vitest';
import { BreadcrumbsTrail, type BreadcrumbTrailItem } from './BreadcrumbsTrail';
import { MobileBreadcrumbs } from './MobileBreadcrumbs';

// House convention (see Footer.test.tsx): stub `t()` to return the key itself,
// so assertions target the stable `breadcrumbs.*` keys rather than resolved
// copy. Real per-locale resolution is proved separately in
// MobileBreadcrumbs.i18n.test.tsx against the actual layout.*.json bundles.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const homeHref = '/home';

const fixture: BreadcrumbTrailItem[] = [
  { label: 'Green Energy', href: '/spaces/green-energy', avatar: { src: '/ge.png', initials: 'GE' } },
  { label: 'Batteries', avatar: { initials: 'BA' } },
  { label: 'Overview', icon: Settings },
];

function mockMatchMedia(initialMatches: boolean) {
  let matches = initialMatches;
  const listeners = new Set<(event: { matches: boolean }) => void>();
  const mql = {
    get matches() {
      return matches;
    },
    media: '(min-width: 768px)',
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: (_type: string, cb: (event: { matches: boolean }) => void) => listeners.add(cb),
    removeEventListener: (_type: string, cb: (event: { matches: boolean }) => void) => listeners.delete(cb),
    dispatchEvent: () => false,
  };
  window.matchMedia = vi.fn().mockReturnValue(mql as unknown as MediaQueryList);
  return {
    setDesktop(next: boolean) {
      matches = next;
      for (const cb of listeners) cb({ matches: next });
    },
  };
}

// Radix's modal DropdownMenu sets `document.body.style.pointerEvents = 'none'`
// while open (so an outside click anywhere is detected as dismissal even
// though it never literally hits the trigger's own hit-test box) — real
// browser behavior, not a test artifact. user-event's default strict
// pointer-events guard refuses to simulate a click in that state, so every
// test here disables that guard to exercise the same dismissal path a real
// tap produces.
function setup() {
  mockMatchMedia(false);
  return userEvent.setup({ pointerEventsCheck: 0 });
}

const openTriggerName = 'breadcrumbs.openLocationHierarchy';

async function openPanel(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: openTriggerName }));
  return screen.getByRole('menu');
}

describe('MobileBreadcrumbs', () => {
  test('items: [] renders nothing', () => {
    setup();
    const { container } = render(<MobileBreadcrumbs items={[]} homeHref={homeHref} />);
    expect(container).toBeEmptyDOMElement();
  });

  test('wrapper is md:hidden (the exact complement of the desktop hidden md:inline-flex) and shows an aria-hidden separator before the pill', () => {
    setup();
    const { container } = render(<MobileBreadcrumbs items={fixture} homeHref={homeHref} />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).toContain('md:hidden');
    expect(wrapper.className).not.toContain('md:flex');
    expect(wrapper.className).not.toContain('md:inline-flex');
    const separator = wrapper.querySelector('svg.lucide-chevron-right') as SVGElement;
    expect(separator).toBeTruthy();
    expect(separator.getAttribute('aria-hidden')).toBe('true');
  });

  test('trigger accessible name is the i18n key, not the literal ellipsis', () => {
    setup();
    render(<MobileBreadcrumbs items={fixture} homeHref={homeHref} />);
    const trigger = screen.getByRole('button', { name: openTriggerName });
    expect(trigger).toBeInTheDocument();
    expect(trigger).not.toHaveAccessibleName('…');
  });

  test('opening shows the heading, a divider, and rows Home-first then every trail entry in order', async () => {
    const user = setup();
    render(<MobileBreadcrumbs items={fixture} homeHref={homeHref} />);
    const menu = await openPanel(user);
    expect(within(menu).getByText('breadcrumbs.locationHierarchy')).toBeInTheDocument();
    expect(within(menu).getByRole('separator')).toBeInTheDocument();
    const menuItems = within(menu).getAllByRole('menuitem');
    expect(menuItems[0]).toHaveTextContent('breadcrumbs.home');
    expect(menuItems[1]).toHaveTextContent('Green Energy');
    // Batteries has no href — it is inert, not a menuitem — so the current row follows directly.
    expect(menuItems[2]).toHaveTextContent('Overview');
  });

  test('row identity: avatar-with-src, avatar-initials fallback, and icon — via the shared CrumbVisual', async () => {
    const user = setup();
    render(<MobileBreadcrumbs items={fixture} homeHref={homeHref} />);
    await openPanel(user);

    const geRow = screen.getByRole('menuitem', { name: /Green Energy/ });
    const geImg = geRow.querySelector('img') as HTMLImageElement;
    expect(geImg.getAttribute('src')).toBe('/ge.png');
    expect(geImg.getAttribute('alt')).toBe('');

    const battRow = screen.getByText('Batteries').closest('div') as HTMLElement;
    expect(within(battRow).getByText('BA')).toBeInTheDocument();

    const overviewRow = screen.getByRole('menuitem', { name: /Overview/ });
    expect(overviewRow.querySelector('svg.lucide-settings')).toBeTruthy();
  });

  test('ancestor rows with href are anchors carrying exactly that href; the Home row links homeHref', async () => {
    const user = setup();
    render(<MobileBreadcrumbs items={fixture} homeHref={homeHref} />);
    await openPanel(user);

    const homeRow = screen.getByRole('menuitem', { name: /breadcrumbs\.home/ });
    expect(homeRow.tagName).toBe('A');
    expect(homeRow.getAttribute('href')).toBe(homeHref);

    const geRow = screen.getByRole('menuitem', { name: /Green Energy/ });
    expect(geRow.tagName).toBe('A');
    expect(geRow.getAttribute('href')).toBe('/spaces/green-energy');
  });

  test('a non-last row without href is inert: no menuitem role, no anchor, not focusable', async () => {
    const user = setup();
    render(<MobileBreadcrumbs items={fixture} homeHref={homeHref} />);
    await openPanel(user);

    expect(screen.queryByRole('menuitem', { name: /Batteries/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Batteries/ })).not.toBeInTheDocument();
    const battRow = screen.getByText('Batteries').closest('div') as HTMLElement;
    expect(battRow.tagName).toBe('DIV');
    expect(battRow).not.toHaveAttribute('tabindex');
  });

  test('the last row (current) is not a link, exposes aria-current, and selecting it only closes the panel', async () => {
    const user = setup();
    render(<MobileBreadcrumbs items={fixture} homeHref={homeHref} />);
    await openPanel(user);

    const currentRow = screen.getByRole('menuitem', { name: /Overview/ });
    expect(currentRow.tagName).not.toBe('A');
    expect(currentRow.getAttribute('aria-current')).toBe('page');
    expect(within(currentRow).getByText('breadcrumbs.current')).toBeInTheDocument();

    await user.click(currentRow);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  test('re-activating the trigger while open toggles the panel closed', async () => {
    const user = setup();
    render(<MobileBreadcrumbs items={fixture} homeHref={homeHref} />);
    const trigger = screen.getByRole('button', { name: openTriggerName });
    await user.click(trigger);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await user.click(trigger);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  test('Escape closes the panel without navigating and returns focus to the trigger', async () => {
    const user = setup();
    render(<MobileBreadcrumbs items={fixture} homeHref={homeHref} />);
    const trigger = screen.getByRole('button', { name: openTriggerName });
    await user.click(trigger);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  test('clicking outside the panel closes it without navigating', async () => {
    const user = setup();
    render(
      <div>
        <MobileBreadcrumbs items={fixture} homeHref={homeHref} />
        <div data-testid="outside">outside</div>
      </div>
    );
    await openPanel(user);
    await user.click(screen.getByTestId('outside'));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  test('the viewport crossing to >=768px while open force-closes the panel and leaves no portal residue', async () => {
    const media = mockMatchMedia(false);
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<MobileBreadcrumbs items={fixture} homeHref={homeHref} />);
    await openPanel(user);

    await act(async () => {
      media.setDesktop(true);
    });

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(document.querySelector('[data-radix-popper-content-wrapper]')).not.toBeInTheDocument();
    expect(document.body.style.pointerEvents).not.toBe('none');
  });

  test('the component source contains no analytics/telemetry calls or user-agent sniffing', () => {
    const source = readFileSync(path.join(process.cwd(), 'src/crd/components/common/MobileBreadcrumbs.tsx'), 'utf-8');
    expect(source).not.toMatch(/analytics|trackEvent|navigator\.userAgent|userAgentData/i);
  });
});

describe('MobileBreadcrumbs presentation fidelity (indentation, glyphs, tint/badge, sizing)', () => {
  test('indent increases exactly one step per row depth (Home is the unindented baseline)', async () => {
    const user = setup();
    render(<MobileBreadcrumbs items={fixture} homeHref={homeHref} />);
    await openPanel(user);

    const homeRow = screen.getByRole('menuitem', { name: /breadcrumbs\.home/ });
    const geRow = screen.getByRole('menuitem', { name: /Green Energy/ });
    const battRow = screen.getByText('Batteries').closest('div') as HTMLElement;
    const overviewRow = screen.getByRole('menuitem', { name: /Overview/ });

    expect(homeRow.className).toContain('px-2');
    expect(homeRow.className).not.toMatch(/\bpl-(6|10|14|18|22)\b/);
    expect(geRow.className).toContain('pl-6');
    expect(battRow.className).toContain('pl-10');
    expect(overviewRow.className).toContain('pl-14');
  });

  test('the corner-arrow glyph is present on every non-Home row and absent on Home', async () => {
    const user = setup();
    render(<MobileBreadcrumbs items={fixture} homeHref={homeHref} />);
    await openPanel(user);

    const homeRow = screen.getByRole('menuitem', { name: /breadcrumbs\.home/ });
    expect(homeRow.querySelector('svg.lucide-corner-down-right')).toBeNull();
    expect(homeRow.querySelector('svg.lucide-house')).toBeTruthy();

    const geRow = screen.getByRole('menuitem', { name: /Green Energy/ });
    const corner = geRow.querySelector('svg.lucide-corner-down-right') as SVGElement;
    expect(corner).toBeTruthy();
    expect(corner.getAttribute('aria-hidden')).toBe('true');

    const battRow = screen.getByText('Batteries').closest('div') as HTMLElement;
    expect(battRow.querySelector('svg.lucide-corner-down-right')).toBeTruthy();

    const overviewRow = screen.getByRole('menuitem', { name: /Overview/ });
    expect(overviewRow.querySelector('svg.lucide-corner-down-right')).toBeTruthy();
  });

  test('only the last row carries the tint background and the Current badge', async () => {
    const user = setup();
    render(<MobileBreadcrumbs items={fixture} homeHref={homeHref} />);
    await openPanel(user);

    const homeRow = screen.getByRole('menuitem', { name: /breadcrumbs\.home/ });
    const geRow = screen.getByRole('menuitem', { name: /Green Energy/ });
    const overviewRow = screen.getByRole('menuitem', { name: /Overview/ });

    expect(homeRow.className).not.toContain('bg-primary/10');
    expect(geRow.className).not.toContain('bg-primary/10');
    expect(overviewRow.className).toContain('bg-primary/10');
    expect(within(overviewRow).getByText('breadcrumbs.current')).toBeInTheDocument();
    expect(within(homeRow).queryByText('breadcrumbs.current')).not.toBeInTheDocument();
    expect(within(geRow).queryByText('breadcrumbs.current')).not.toBeInTheDocument();
  });

  test('a long label truncates visually while the full text remains the row accessible name', async () => {
    const user = setup();
    const longLabel = 'A'.repeat(80);
    // Two items so the long label sits on a non-last (ancestor) row — the
    // last row always renders as the current, badge-appended item regardless
    // of its own href, which would otherwise fold "breadcrumbs.current" into
    // the computed accessible name being asserted here.
    const longFixture: BreadcrumbTrailItem[] = [{ label: longLabel, href: '/long' }, { label: 'Current page' }];
    render(<MobileBreadcrumbs items={longFixture} homeHref={homeHref} />);
    await openPanel(user);

    const row = screen.getByRole('menuitem', { name: longLabel });
    const labelSpan = within(row).getByText(longLabel);
    expect(labelSpan.className).toContain('truncate');
  });

  test('the panel content fits a 360px viewport and scrolls internally for deep trails', async () => {
    const user = setup();
    render(<MobileBreadcrumbs items={fixture} homeHref={homeHref} />);
    await openPanel(user);
    const content = screen.getByRole('menu');
    expect(content.className).toContain('max-w-[calc(100vw-1.5rem)]');
    expect(content.className).toContain('overflow-y-auto');
    expect(content.className).toMatch(/max-h-\[/);
  });
});

describe('MobileBreadcrumbs accessibility', () => {
  test('aria-expanded reflects open/closed state', async () => {
    const user = setup();
    render(<MobileBreadcrumbs items={fixture} homeHref={homeHref} />);
    const trigger = screen.getByRole('button', { name: openTriggerName });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  test('aria-current="page" is present on the last row only', async () => {
    const user = setup();
    render(<MobileBreadcrumbs items={fixture} homeHref={homeHref} />);
    await openPanel(user);

    expect(screen.getByRole('menuitem', { name: /breadcrumbs\.home/ })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('menuitem', { name: /Green Energy/ })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('menuitem', { name: /Overview/ })).toHaveAttribute('aria-current', 'page');
  });

  test('keyboard: Enter opens with focus already on the first row; ArrowDown traverses; Enter on the current row closes without navigating', async () => {
    const user = setup();
    render(<MobileBreadcrumbs items={fixture} homeHref={homeHref} />);
    const trigger = screen.getByRole('button', { name: openTriggerName });
    trigger.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('menu')).toBeInTheDocument();

    // Radix auto-focuses the first registered menu item as soon as the panel
    // mounts — no arrow key needed to "move focus in".
    const homeRow = screen.getByRole('menuitem', { name: /breadcrumbs\.home/ });
    expect(homeRow).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    const geRow = screen.getByRole('menuitem', { name: /Green Energy/ });
    expect(geRow).toHaveFocus();

    // Batteries has no href and is never registered as a menu item, so the
    // next ArrowDown lands directly on the current (last) row.
    await user.keyboard('{ArrowDown}');
    const currentRow = screen.getByRole('menuitem', { name: /Overview/ });
    expect(currentRow).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  test('the trigger meets the >=44px touch-target floor', () => {
    setup();
    render(<MobileBreadcrumbs items={fixture} homeHref={homeHref} />);
    const trigger = screen.getByRole('button', { name: openTriggerName });
    expect(trigger.className).toContain('min-h-11');
    expect(trigger.className).toContain('min-w-11');
  });

  test('every decorative glyph is aria-hidden', async () => {
    const user = setup();
    const { container } = render(<MobileBreadcrumbs items={fixture} homeHref={homeHref} />);
    await openPanel(user);
    const decorativeSelectors = [
      'svg.lucide-chevron-right',
      'svg.lucide-chevron-down',
      'svg.lucide-corner-down-right',
      'svg.lucide-house',
      'svg.lucide-settings',
    ];
    for (const selector of decorativeSelectors) {
      const nodes = document.querySelectorAll(selector);
      expect(nodes.length).toBeGreaterThan(0);
      for (const node of Array.from(nodes)) {
        expect(node.getAttribute('aria-hidden')).toBe('true');
      }
    }
    // The ellipsis's screen-reader label is real text, not decorative.
    expect(container.querySelector('.sr-only')).toHaveTextContent(openTriggerName);
  });
});

describe('MobileBreadcrumbs / BreadcrumbsTrail complementarity and shared data', () => {
  test('both components mount from the same items array without mutating it', () => {
    setup();
    const items: BreadcrumbTrailItem[] = [
      { label: 'Green Energy', href: '/spaces/green-energy' },
      { label: 'Batteries' },
    ];
    const frozen = JSON.parse(JSON.stringify(items));

    const { container } = render(
      <div>
        <BreadcrumbsTrail items={items} />
        <MobileBreadcrumbs items={items} homeHref={homeHref} />
      </div>
    );

    expect(items).toEqual(frozen);
    // Desktop keeps its own visibility class; mobile is its exact complement
    // (checked as a plain DOM query — Radix's aria-hide-others while a menu
    // is open would otherwise mask this from the accessibility tree, which
    // isn't what this assertion is about).
    const nav = container.querySelector('nav[aria-label="breadcrumb"]') as HTMLElement;
    expect(nav.className).toContain('md:inline-flex');
    const mobileWrapper = container.querySelector('.md\\:hidden') as HTMLElement;
    expect(mobileWrapper).toBeTruthy();
  });
});
