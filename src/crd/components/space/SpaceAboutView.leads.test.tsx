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
  test('a lead with a preview opens the card, without a Message action inside the dialog', async () => {
    render(
      <SpaceAboutView
        data={data([
          {
            ...mila,
            preview: { id: 'mila', type: 'user', name: 'Mila Janssen', tagline: 'Maps cities', canMessage: true },
          },
        ])}
      />
    );
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
