import { type ComponentType, Fragment } from 'react';
import { cn } from '@/crd/lib/utils';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/crd/primitives/breadcrumb';

export type BreadcrumbTrailItem = {
  label: string;
  href?: string;
  icon?: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  /**
   * Space/subspace identity image rendered as a small rounded square before the
   * label (L0 hops pass the cardBanner, subspaces their avatar). Falls back to
   * initials when `src` is missing. Takes precedence over `icon`.
   */
  avatar?: { src?: string; initials: string };
};

type BreadcrumbsTrailProps = {
  items: BreadcrumbTrailItem[];
  className?: string;
};

export function BreadcrumbsTrail({ items, className }: BreadcrumbsTrailProps) {
  if (items.length === 0) return null;

  return (
    <Breadcrumb className={cn('hidden md:inline-flex', className)}>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const Icon = item.icon;

          return (
            <Fragment key={`${item.label}|${item.href ?? ''}`}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {item.avatar ? (
                  <span
                    aria-hidden="true"
                    className="flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-primary/15 text-primary text-badge"
                  >
                    {item.avatar.src ? (
                      <img src={item.avatar.src} alt="" className="size-full object-cover" />
                    ) : (
                      item.avatar.initials
                    )}
                  </span>
                ) : (
                  Icon && <Icon aria-hidden={true} className="size-3.5 shrink-0" />
                )}
                {isLast ? (
                  <BreadcrumbPage className="font-medium">{item.label}</BreadcrumbPage>
                ) : item.href ? (
                  <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                ) : (
                  <span>{item.label}</span>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
