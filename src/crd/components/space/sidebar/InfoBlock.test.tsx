import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import type { ContributorPreviewData } from '@/crd/components/contributor/ContributorHoverCard';
import type { LeadItem } from './InfoBlock';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Shared jsdom-safe avatar double from src/crd/primitives/__mocks__/avatar.tsx.
vi.mock('@/crd/primitives/avatar');

const { InfoBlock } = await import('./InfoBlock');

const MESSAGE = { name: 'contributors.card.message' };

const orgPreview: ContributorPreviewData = {
  id: 'org-1',
  type: 'organization',
  name: 'Green Org',
  href: '/organization/green',
  tagline: 'Greening cities',
  canMessage: false,
};

const orgLead: LeadItem = {
  id: 'org-1',
  name: 'Green Org',
  initials: 'GO',
  href: '/organization/green',
  type: 'org',
};

const hoverLead = () => userEvent.hover(screen.getByRole('link', { name: /Green Org/ }));

describe('InfoBlock lead hover card', () => {
  test('a lead with a preview opens a card with the tagline and, for an organisation, no message button', async () => {
    render(<InfoBlock description="" leads={[{ ...orgLead, preview: orgPreview }]} onMessageContributor={vi.fn()} />);
    await hoverLead();
    expect(await screen.findByText('Greening cities')).toBeInTheDocument();
    expect(screen.queryByRole('button', MESSAGE)).not.toBeInTheDocument();
  });

  test('a lead without a preview keeps the plain link and opens nothing', async () => {
    render(<InfoBlock description="" leads={[orgLead]} />);
    await hoverLead();
    await new Promise(resolve => setTimeout(resolve, 400));
    expect(document.querySelector('[data-slot="hover-card-content"]')).toBeNull();
  });

  test('a user lead that can be messaged reports the preview to onMessageContributor', async () => {
    const userPreview: ContributorPreviewData = {
      ...orgPreview,
      id: 'u-1',
      type: 'user',
      name: 'Green Org',
      canMessage: true,
    };
    const onMessageContributor = vi.fn();
    render(
      <InfoBlock
        description=""
        leads={[{ ...orgLead, type: 'person', preview: userPreview }]}
        onMessageContributor={onMessageContributor}
      />
    );
    await hoverLead();
    await userEvent.click(await screen.findByRole('button', MESSAGE));
    expect(onMessageContributor).toHaveBeenCalledWith(userPreview);
  });
});
