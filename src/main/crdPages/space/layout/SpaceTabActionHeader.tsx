import type { ReactNode } from 'react';
import { TabStateHeader } from '@/crd/components/space/TabStateHeader';
import { useScreenSize } from '@/crd/hooks/useMediaQuery';
import { SpaceTabsActionPortal } from './SpaceTabsActionPortal';

type SpaceTabActionHeaderProps = {
  /** Markdown description for the active tab / flow state. */
  description?: string;
  /** Primary action for the tab (e.g. an "Add Post" / "Create Subspace" Button). */
  action?: ReactNode;
  className?: string;
};

/**
 * Drop-in replacement for `TabStateHeader` on space tab pages that lifts the
 * primary action up onto the tab bar row on desktop (via `SpaceTabsActionPortal`)
 * while keeping it next to the description on the mobile layout, where there is
 * no top tab bar to host it.
 */
export function SpaceTabActionHeader({ description, action, className }: SpaceTabActionHeaderProps) {
  const { isSmallScreen } = useScreenSize();

  return (
    <>
      {action && !isSmallScreen && <SpaceTabsActionPortal>{action}</SpaceTabsActionPortal>}
      <TabStateHeader description={description} action={isSmallScreen ? action : undefined} className={className} />
    </>
  );
}
