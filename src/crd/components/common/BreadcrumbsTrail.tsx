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
                {Icon && <Icon aria-hidden={true} className="size-3.5 shrink-0" />}
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
