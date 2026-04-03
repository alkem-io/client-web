import { Menu } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from '@/crd/hooks/useMediaQuery';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent } from '@/crd/primitives/dialog';

type DashboardLayoutProps = {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function DashboardLayout({ sidebar, children, className }: DashboardLayoutProps) {
  const { t } = useTranslation('crd-dashboard');
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 max-w-[1600px] mx-auto px-4 sm:px-6 py-6',
        className
      )}
    >
      {isDesktop ? (
        <nav aria-label="Dashboard navigation" className="hidden md:block">
          {sidebar}
        </nav>
      ) : (
        <>
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)} aria-label={t('sidebar.openMenu')}>
              <Menu className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>
          <Dialog open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <DialogContent className="h-[100dvh] w-[280px] p-4 rounded-none sm:rounded-none">
              <nav aria-label="Dashboard navigation">{sidebar}</nav>
            </DialogContent>
          </Dialog>
        </>
      )}
      <main className="min-w-0">{children}</main>
    </div>
  );
}
