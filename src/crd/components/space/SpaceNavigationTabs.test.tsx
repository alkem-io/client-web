import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { MAIN_CONTENT_ID } from '@/crd/lib/mainContent';
import { SpaceNavigationTabs } from './SpaceNavigationTabs';

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const oneTab = [{ index: 0, label: 'Home' }];
const twoTabs = [
  { index: 0, label: 'Home' },
  { index: 3, label: 'Knowledge' },
];

describe('SpaceNavigationTabs', () => {
  it('hides the desktop tab strip with one visible state but keeps the action slot', () => {
    render(
      <SpaceNavigationTabs
        tabs={oneTab}
        activeIndex={0}
        onTabChange={() => {}}
        action={<button type="button">share</button>}
      />
    );
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'share' })).toBeInTheDocument();
  });

  it('hides the mobile tab with one visible state but keeps the menu button', () => {
    render(
      <SpaceNavigationTabs
        tabs={oneTab}
        activeIndex={0}
        onTabChange={() => {}}
        onMenuClick={() => {}}
        isSmallScreen={true}
      />
    );
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'mobile.menu' })).toBeInTheDocument();
  });

  it('keeps the route to the sole visible state while a hidden section is selected (desktop)', () => {
    render(<SpaceNavigationTabs tabs={[{ index: 3, label: 'Knowledge' }]} activeIndex={0} onTabChange={() => {}} />);
    expect(screen.getByRole('tab', { name: 'Knowledge' })).toBeInTheDocument();
  });

  it('keeps the route to the sole visible state while a hidden section is selected (mobile)', () => {
    render(
      <SpaceNavigationTabs
        tabs={[{ index: 3, label: 'Knowledge' }]}
        activeIndex={0}
        onTabChange={() => {}}
        onMenuClick={() => {}}
        isSmallScreen={true}
      />
    );
    expect(screen.getByRole('tab', { name: 'Knowledge' })).toBeInTheDocument();
  });

  it.each([
    ['desktop', false],
    ['mobile', true],
  ])('moves focus to the main content when choosing the sole visible state removes the tabs (%s)', async (_, isSmallScreen) => {
    const Harness = () => {
      const [activeIndex, setActiveIndex] = useState(0);
      return (
        <main id={MAIN_CONTENT_ID} tabIndex={-1}>
          <SpaceNavigationTabs
            tabs={[{ index: 3, label: 'Knowledge' }]}
            activeIndex={activeIndex}
            onTabChange={setActiveIndex}
            isSmallScreen={isSmallScreen}
          />
        </main>
      );
    };
    const user = userEvent.setup();
    render(<Harness />);
    screen.getByRole('tab', { name: 'Knowledge' }).focus();
    await user.keyboard('{Enter}');
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveFocus();
  });

  it('shows the tabs when more than one state is visible', () => {
    render(<SpaceNavigationTabs tabs={twoTabs} activeIndex={0} onTabChange={() => {}} />);
    expect(screen.getAllByRole('tab')).toHaveLength(2);
  });
});
