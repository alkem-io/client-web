import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ApplicationsBlock } from './ApplicationsBlock';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Radix only mounts AvatarPrimitive.Image once the browser reports the image as
// loaded, which never happens in jsdom. Swap it for a plain <img> so the props
// this component passes down are observable (same approach as
// CrdRedirectToAncestorDialog.test.tsx).
vi.mock('@/crd/primitives/avatar', () => ({
  Avatar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AvatarImage: ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
    <img src={src} alt={alt} className={className} />
  ),
  AvatarFallback: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

const applications = [
  {
    id: 'app-1',
    spaceName: 'Welcome Sub',
    spaceHref: '/challenges/welcome-sub',
  },
  {
    id: 'app-2',
    spaceName: 'Second Space',
    spaceHref: '/spaces/second',
    spaceImageUrl: 'https://example.com/card-banner.png',
  },
];

describe('ApplicationsBlock', () => {
  it('renders nothing when there are no applications', () => {
    const { container } = render(<ApplicationsBlock applications={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('lists each pending application, linking to its space', () => {
    render(<ApplicationsBlock applications={applications} />);

    expect(screen.getByRole('link', { name: 'Welcome Sub' })).toHaveAttribute('href', '/challenges/welcome-sub');
    expect(screen.getByRole('link', { name: 'Second Space' })).toHaveAttribute('href', '/spaces/second');
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('offers no accept/decline actions — the applicant has nothing to act on', () => {
    render(<ApplicationsBlock applications={applications} />);

    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('marks each row as pending', () => {
    render(<ApplicationsBlock applications={applications} />);

    expect(screen.getAllByText('applications.pending')).toHaveLength(2);
  });

  it('crops the wide cardBanner to fill the square tile', () => {
    render(<ApplicationsBlock applications={applications} />);

    const banner = screen.getByAltText('Second Space');
    expect(banner).toHaveAttribute('src', 'https://example.com/card-banner.png');
    expect(banner).toHaveClass('object-cover');
  });
});
