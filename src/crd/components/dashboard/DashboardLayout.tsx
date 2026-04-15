import { Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

type DashboardLayoutProps = {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function DashboardLayout({ sidebar, children, className }: DashboardLayoutProps) {
  const { t } = useTranslation('crd-dashboard');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Animate in: mount first, then set visible on next frame
  useEffect(() => {
    if (drawerOpen) {
      requestAnimationFrame(() => setVisible(true));
    }
  }, [drawerOpen]);

  const closeDrawer = () => {
    setVisible(false);
    // Wait for exit animation before unmounting
    setTimeout(() => setDrawerOpen(false), 200);
    triggerRef.current?.focus();
  };

  // Focus trap + Escape handling
  useEffect(() => {
    if (!drawerOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDrawer();
        return;
      }
      if (e.key !== 'Tab' || !drawerRef.current) return;

      const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Focus first focusable element on open
    const timer = setTimeout(() => {
      const firstFocusable = drawerRef.current?.querySelector<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    }, 50);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  return (
    <>
      <div
        className={cn(
          'grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 max-w-[1600px] mx-auto px-4 sm:px-6 py-6',
          className
        )}
      >
        {/* Desktop sidebar */}
        <nav aria-label="Dashboard navigation" className="hidden md:block">
          {sidebar}
        </nav>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button
            ref={triggerRef}
            variant="ghost"
            size="sm"
            onClick={() => setDrawerOpen(true)}
            aria-label={t('sidebar.openMenu')}
            aria-expanded={drawerOpen}
            aria-controls="dashboard-mobile-drawer"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>

        {/* Content */}
        <div className="min-w-0 space-y-6">{children}</div>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="presentation">
          {/* Backdrop */}
          <div
            className={cn(
              'absolute inset-0 bg-black/50 transition-opacity duration-200',
              visible ? 'opacity-100' : 'opacity-0'
            )}
            onClick={closeDrawer}
            aria-hidden="true"
          />
          {/* Drawer panel */}
          <nav
            ref={drawerRef}
            id="dashboard-mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Dashboard navigation"
            className={cn(
              'absolute inset-y-0 left-0 w-[280px] bg-background shadow-xl overflow-y-auto transition-transform duration-200 ease-out',
              visible ? 'translate-x-0' : '-translate-x-full'
            )}
          >
            <div className="flex items-center justify-end p-2 sticky top-0 bg-background z-10">
              <Button variant="ghost" size="sm" onClick={closeDrawer} aria-label={t('sidebar.closeMenu')}>
                <X className="h-5 w-5" aria-hidden="true" />
              </Button>
            </div>
            <div className="px-4 pb-6">{sidebar}</div>
          </nav>
        </div>
      )}
    </>
  );
}
