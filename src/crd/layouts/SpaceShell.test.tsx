import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { SpaceShell } from './SpaceShell';

const renderShell = (props: { sidebarCollapsed?: boolean; fullWidth?: boolean; sidebar?: boolean }) =>
  render(
    <SpaceShell
      header={<div>header</div>}
      sidebar={props.sidebar === false ? undefined : <div data-testid="sidebar-slot" />}
      sidebarCollapsed={props.sidebarCollapsed}
      fullWidth={props.fullWidth}
    >
      <div data-testid="content" />
    </SpaceShell>
  );

describe('SpaceShell sidebar column', () => {
  test('with a sidebar, the column renders at lg and the content spans 8', () => {
    renderShell({});
    const sidebarColumn = screen.getByTestId('sidebar-slot').parentElement as HTMLElement;
    expect(sidebarColumn.className).toContain('lg:block');
    expect(sidebarColumn.className).toContain('col-span-2');
    const content = screen.getByTestId('content').parentElement as HTMLElement;
    expect(content.className).toContain('lg:col-span-8');
  });

  test('sidebarCollapsed keeps the slot mounted but hidden, content takes the no-sidebar width', () => {
    renderShell({ sidebarCollapsed: true });
    // The slot must stay in the DOM: portals resolve their target element once on mount.
    const sidebarColumn = screen.getByTestId('sidebar-slot').parentElement as HTMLElement;
    expect(sidebarColumn.className).toBe('hidden');
    const content = screen.getByTestId('content').parentElement as HTMLElement;
    // Same placement as the no-sidebar case (contentColumnClass).
    expect(content.className).toContain('lg:col-span-10');
    expect(content.className).not.toContain('lg:col-span-8');
  });

  test('sidebarCollapsed + fullWidth spans all 12 columns', () => {
    renderShell({ sidebarCollapsed: true, fullWidth: true });
    const content = screen.getByTestId('content').parentElement as HTMLElement;
    expect(content.className).toContain('lg:col-span-12');
  });

  test('no sidebar at all behaves as before (content in the inset band)', () => {
    renderShell({ sidebar: false });
    expect(screen.queryByTestId('sidebar-slot')).not.toBeInTheDocument();
    const content = screen.getByTestId('content').parentElement as HTMLElement;
    expect(content.className).toContain('lg:col-span-10');
  });
});
