import { render, screen } from '@testing-library/react';
import { House } from 'lucide-react';
import { describe, expect, test } from 'vitest';
import { BreadcrumbsTrail, type BreadcrumbTrailItem } from './BreadcrumbsTrail';

const AVATAR_SPAN_CLASS =
  'flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-primary/15 text-primary text-badge';

const fixture: BreadcrumbTrailItem[] = [
  { label: 'Green Energy', href: '/green-energy', avatar: { src: '/space.png', initials: 'GE' } },
  { label: 'Batteries', avatar: { initials: 'BA' } },
  { label: 'Settings', icon: House },
  { label: 'General' },
];

describe('BreadcrumbsTrail desktop DOM parity', () => {
  test('root carries the desktop-only visibility classes', () => {
    render(<BreadcrumbsTrail items={fixture} />);
    const nav = screen.getByRole('navigation', { name: 'breadcrumb' });
    expect(nav.className).toContain('hidden');
    expect(nav.className).toContain('md:inline-flex');
  });

  test('avatar-with-src item renders the exact avatar span classes and an empty-alt image', () => {
    render(<BreadcrumbsTrail items={fixture} />);
    const link = screen.getByRole('link', { name: 'Green Energy' });
    const item = link.closest('li') as HTMLElement;
    const avatarSpan = item.querySelector('span[aria-hidden="true"]') as HTMLElement;
    expect(avatarSpan.className).toBe(AVATAR_SPAN_CLASS);
    const img = avatarSpan.querySelector('img') as HTMLImageElement;
    expect(img.getAttribute('alt')).toBe('');
    expect(img.className).toBe('size-full object-cover');
  });

  test('avatar-initials-fallback item renders the initials text in the same avatar span', () => {
    render(<BreadcrumbsTrail items={fixture} />);
    const item = screen.getByText('Batteries').closest('li') as HTMLElement;
    const avatarSpan = item.querySelector('span[aria-hidden="true"]') as HTMLElement;
    expect(avatarSpan.className).toBe(AVATAR_SPAN_CLASS);
    expect(avatarSpan.textContent).toBe('BA');
    expect(avatarSpan.querySelector('img')).not.toBeInTheDocument();
  });

  test('icon item renders the icon glyph, aria-hidden, no avatar span', () => {
    render(<BreadcrumbsTrail items={fixture} />);
    const item = screen.getByText('Settings').closest('li') as HTMLElement;
    expect(item.querySelector('span[aria-hidden="true"]')).not.toBeInTheDocument();
    const svg = item.querySelector('svg[aria-hidden="true"]') as SVGElement;
    expect(svg).toBeTruthy();
    expect(svg.getAttribute('class')).toContain('size-3.5');
    expect(svg.getAttribute('class')).toContain('shrink-0');
  });

  test('non-last item with href renders as a link with that href', () => {
    render(<BreadcrumbsTrail items={fixture} />);
    const link = screen.getByRole('link', { name: 'Green Energy' });
    expect(link.getAttribute('href')).toBe('/green-energy');
  });

  test('non-last item without href renders as a plain span, not a link', () => {
    render(<BreadcrumbsTrail items={fixture} />);
    expect(screen.queryByRole('link', { name: 'Batteries' })).not.toBeInTheDocument();
    const span = screen.getByText('Batteries');
    expect(span.tagName).toBe('SPAN');
  });

  test('last item renders as the page marker, not a link', () => {
    render(<BreadcrumbsTrail items={fixture} />);
    expect(screen.queryByRole('link', { name: 'General' })).not.toBeInTheDocument();
    const page = screen.getByText('General');
    expect(page.getAttribute('aria-current')).toBe('page');
    expect(page.className).toContain('font-medium');
  });

  test('empty items renders nothing', () => {
    const { container } = render(<BreadcrumbsTrail items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
