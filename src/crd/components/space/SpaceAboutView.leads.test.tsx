import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import type { SpaceAboutData } from './SpaceAboutView';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Shared jsdom-safe avatar double from src/crd/primitives/__mocks__/avatar.tsx.
vi.mock('@/crd/primitives/avatar');

const { SpaceAboutView } = await import('./SpaceAboutView');

const data = (leadUsers: SpaceAboutData['leadUsers']): SpaceAboutData => ({
  name: 'A space',
  metrics: [],
  leadUsers,
  leadOrganizations: [],
  references: [],
  classifications: [],
});

const mila = { name: 'Mila Janssen', type: 'person' as const, href: '/user/mila' };

describe('SpaceAboutView leads', () => {
  const milaPreview = {
    id: 'mila',
    type: 'user' as const,
    name: 'Mila Janssen',
    tagline: 'Maps cities',
    canMessage: true,
  };

  test('a lead with a preview opens the card with a Message action that messages that lead', async () => {
    const onMessageContributor = vi.fn();
    render(
      <SpaceAboutView data={data([{ ...mila, preview: milaPreview }])} onMessageContributor={onMessageContributor} />
    );
    await userEvent.hover(screen.getByRole('link', { name: /Mila Janssen/ }));
    expect(await screen.findByText('Maps cities')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'contributors.card.message' }));
    expect(onMessageContributor).toHaveBeenCalledWith(milaPreview);
  });

  test('without a Message handler the card has no Message action', async () => {
    render(<SpaceAboutView data={data([{ ...mila, preview: milaPreview }])} />);
    await userEvent.hover(screen.getByRole('link', { name: /Mila Janssen/ }));
    expect(await screen.findByText('Maps cities')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'contributors.card.message' })).not.toBeInTheDocument();
  });

  test('a lead without a preview stays a plain link', async () => {
    render(<SpaceAboutView data={data([mila])} />);
    await userEvent.hover(screen.getByRole('link', { name: /Mila Janssen/ }));
    await new Promise(resolve => setTimeout(resolve, 400));
    expect(document.querySelector('[data-slot="hover-card-content"]')).toBeNull();
  });
});
