import { LayoutGrid } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CrdPlatformNavigationItem } from '@/crd/layouts/types';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/crd/primitives/dropdown-menu';

type PlatformNavigationMenuProps = {
  items: CrdPlatformNavigationItem[];
  currentPath?: string;
};

export function PlatformNavigationMenu({ items, currentPath }: PlatformNavigationMenuProps) {
  const { t } = useTranslation('crd-layout');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild={true}>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground"
          aria-label={t('header.platformNavigation')}
        >
          <LayoutGrid aria-hidden="true" className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col gap-0.5 p-1 min-w-[200px]">
        {items.map(item => {
          const isActive = currentPath?.startsWith(item.href);
          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors cursor-pointer',
                isActive ? 'bg-accent text-primary' : 'text-foreground hover:bg-accent'
              )}
            >
              <span
                aria-hidden="true"
                className={cn('[&>svg]:h-4 [&>svg]:w-4', isActive ? 'text-primary' : 'text-muted-foreground')}
              >
                {item.icon}
              </span>
              <span
                className={cn(
                  'leading-tight',
                  isActive ? 'text-primary font-medium' : 'text-muted-foreground'
                )}
              >
                {item.label}
              </span>
            </a>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
