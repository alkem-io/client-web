import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import type { ContributorPreviewData } from './ContributorHoverCard';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Shared jsdom-safe avatar double from src/crd/primitives/__mocks__/avatar.tsx.
vi.mock('@/crd/primitives/avatar');

const { ContributorHoverCard } = await import('./ContributorHoverCard');

// CollapsibleTagList renders an aria-hidden measuring copy of every tag; text queries skip it.
const HIDDEN_TEXT = 'script, style, [aria-hidden="true"] *';
const MESSAGE = { name: 'contributors.card.message' };

const bob: ContributorPreviewData = {
  id: 'user-bob',
  type: 'user',
  name: 'Bob Builder',
  href: '/user/bob',
  locationLabel: 'Utrecht, NL',
  tagline: 'Builds bridges',
  tags: ['climate', 'governance'],
  canMessage: true,
};

const renderCard = (contributor: ContributorPreviewData, onMessage?: (c: ContributorPreviewData) => void) =>
  render(
    <ContributorHoverCard contributor={contributor} onMessage={onMessage}>
      <a href="/user/bob">Bob</a>
    </ContributorHoverCard>
  );

const openByHover = async () => {
  await userEvent.hover(screen.getByRole('link', { name: 'Bob' }));
  await screen.findByText('Bob Builder');
};

const cardContent = () => document.querySelector('[data-slot="hover-card-content"]') as HTMLElement;

describe('ContributorHoverCard', () => {
  test('a user with every field shows them all and a message button that reports the contributor', async () => {
    const onMessage = vi.fn();
    renderCard(bob, onMessage);
    await openByHover();

    expect(screen.getByText('Utrecht, NL')).toBeInTheDocument();
    expect(screen.getByText('Builds bridges')).toBeInTheDocument();
    expect(screen.getByText('climate', { ignore: HIDDEN_TEXT })).toBeInTheDocument();
    expect(screen.getByText('governance', { ignore: HIDDEN_TEXT })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', MESSAGE));
    expect(onMessage).toHaveBeenCalledWith(bob);
  });

  test('clicking Message closes the card so it does not cover the chat panel', async () => {
    renderCard(bob, vi.fn());
    await openByHover();
    await userEvent.click(screen.getByRole('button', MESSAGE));
    await waitFor(() => expect(screen.queryByText('Bob Builder')).not.toBeInTheDocument());
  });

  test('a user who cannot be messaged gets no message button', async () => {
    renderCard({ ...bob, canMessage: false }, vi.fn());
    await openByHover();
    expect(screen.queryByRole('button', MESSAGE)).not.toBeInTheDocument();
  });

  test('without an onMessage handler there is no message button', async () => {
    renderCard(bob);
    await openByHover();
    expect(screen.queryByRole('button', MESSAGE)).not.toBeInTheDocument();
  });

  test('an organisation (which the mapper never marks messageable) has no message button, and empty tags render no tag list', async () => {
    renderCard({ ...bob, type: 'organization', tags: [], canMessage: false }, vi.fn());
    await openByHover();
    expect(screen.queryByRole('button', MESSAGE)).not.toBeInTheDocument();
    expect(cardContent().querySelector('ul')).toBeNull();
  });

  test('a VC hides its location but shows tagline and tags', async () => {
    renderCard({ ...bob, type: 'virtualContributor', canMessage: false }, vi.fn());
    await openByHover();
    expect(screen.queryByText('Utrecht, NL')).not.toBeInTheDocument();
    expect(screen.getByText('Builds bridges')).toBeInTheDocument();
    expect(screen.getByText('climate', { ignore: HIDDEN_TEXT })).toBeInTheDocument();
  });

  test('no tagline and no tags render neither a tagline paragraph nor a tag list', async () => {
    renderCard({ ...bob, tagline: undefined, tags: undefined });
    await openByHover();
    expect(cardContent().querySelector('p')).toBeNull();
    expect(cardContent().querySelector('ul')).toBeNull();
  });

  test('keyboard focus on the link opens the card and Escape closes it', async () => {
    renderCard(bob);
    const link = screen.getByRole('link', { name: 'Bob' });
    link.focus();
    await screen.findByText('Bob Builder');

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByText('Bob Builder')).not.toBeInTheDocument());
  });
});
