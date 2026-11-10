import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
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

  test('a VC shows "Virtual contributor" instead of a location, plus tagline and tags', async () => {
    renderCard({ ...bob, type: 'virtualContributor', canMessage: false }, vi.fn());
    await openByHover();
    expect(screen.queryByText('Utrecht, NL')).not.toBeInTheDocument();
    expect(screen.getByText('contributors.preview.virtualContributor')).toBeInTheDocument();
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

describe('ContributorHoverCard on a touch screen', () => {
  const realMatchMedia = window.matchMedia;
  // jsdom has no PointerEvent, so fireEvent.pointer* would drop clientY.
  if (!window.PointerEvent) {
    window.PointerEvent = class extends MouseEvent {
      pointerId: number;
      constructor(type: string, init: PointerEventInit = {}) {
        super(type, init);
        this.pointerId = init.pointerId ?? 0;
      }
    } as unknown as typeof PointerEvent;
  }
  beforeEach(() => {
    window.matchMedia = (query: string) => ({ ...realMatchMedia(query), matches: query.includes('hover: none') });
  });
  afterEach(() => {
    window.matchMedia = realMatchMedia;
  });

  const tap = () => userEvent.click(screen.getByRole('link', { name: 'Bob' }));
  const sheet = () => screen.getByRole('dialog', { name: 'Bob Builder' });
  const VIEW_PROFILE = { name: 'contributors.card.viewProfile' };

  test('a tap opens a sheet with the preview and both actions instead of following the link', async () => {
    const onMessage = vi.fn();
    renderCard(bob, onMessage);
    // React handles the click at its root, so read defaultPrevented after it has bubbled past.
    const followed = vi.fn();
    const onWindowClick = (event: MouseEvent) => followed(!event.defaultPrevented);
    window.addEventListener('click', onWindowClick);
    await tap();
    window.removeEventListener('click', onWindowClick);

    expect(followed).toHaveBeenCalledWith(false);
    expect(within(sheet()).getByText('Utrecht, NL')).toBeInTheDocument();
    expect(within(sheet()).getByText('Builds bridges')).toBeInTheDocument();
    expect(within(sheet()).getByRole('link', VIEW_PROFILE)).toHaveAttribute('href', '/user/bob');
    expect(document.querySelector('[data-slot="hover-card-content"]')).toBeNull();

    await userEvent.click(within(sheet()).getByRole('button', MESSAGE));
    expect(onMessage).toHaveBeenCalledWith(bob);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  test('an organisation gets only View profile', async () => {
    renderCard({ ...bob, type: 'organization', canMessage: false }, vi.fn());
    await tap();
    expect(within(sheet()).getByRole('link', VIEW_PROFILE)).toBeInTheDocument();
    expect(within(sheet()).queryByRole('button', MESSAGE)).not.toBeInTheDocument();
  });

  test('your own preview offers only View your profile', async () => {
    renderCard({ ...bob, self: true, canMessage: false }, vi.fn());
    await tap();
    expect(within(sheet()).getByRole('link', { name: 'contributors.preview.viewOwnProfile' })).toBeInTheDocument();
    expect(within(sheet()).queryByRole('button', MESSAGE)).not.toBeInTheDocument();
  });

  test('dragging the sheet down past the threshold closes it; a short drag does not', async () => {
    renderCard(bob);
    await tap();
    const content = sheet();
    content.setPointerCapture = () => {};

    fireEvent.pointerDown(content, { clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(content, { clientY: 140, pointerId: 1 });
    fireEvent.pointerUp(content, { pointerId: 1 });
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.pointerDown(content, { clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(content, { clientY: 200, pointerId: 1 });
    fireEvent.pointerUp(content, { pointerId: 1 });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
