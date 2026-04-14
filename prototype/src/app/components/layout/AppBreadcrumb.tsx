import React from "react";
import { Link } from "react-router";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@/app/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { useBreadcrumbs, type BreadcrumbSegment } from "@/app/hooks/useBreadcrumbs";
import { useIsMobile } from "@/app/components/ui/use-mobile";

export interface AppBreadcrumbProps {
  className?: string;
  /** Show a chevron separator before the first segment (between logo and breadcrumb) */
  showLeadingSeparator?: boolean;
}

export function AppBreadcrumb({ className, showLeadingSeparator }: AppBreadcrumbProps) {
  const segments = useBreadcrumbs();
  const isMobile = useIsMobile();

  // No segments = dashboard or root — nothing to show after the logo
  if (segments.length === 0) return null;

  // Responsive collapse: on mobile with 3+ segments, collapse middle segments
  const shouldCollapse = isMobile && segments.length >= 3;

  const truncateClass = isMobile ? "max-w-[100px]" : "max-w-[160px]";

  if (shouldCollapse) {
    const first = segments[0];
    const last = segments[segments.length - 1];
    const middle = segments.slice(1, -1);

    return (
      <Breadcrumb className={className}>
        <BreadcrumbList className="flex-nowrap">
          {/* Leading separator between logo and breadcrumb */}
          {showLeadingSeparator && <BreadcrumbSeparator />}

          {/* First segment */}
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={first.href} className="flex items-center gap-1.5">
                {first.icon}
                <span className={`truncate ${truncateClass}`} title={first.label}>
                  {first.label}
                </span>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          {/* Ellipsis dropdown for collapsed middle segments */}
          <BreadcrumbItem>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1" aria-label="Show hidden breadcrumb segments">
                <BreadcrumbEllipsis />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {middle.map((seg) => (
                  <DropdownMenuItem key={seg.href} asChild>
                    <Link to={seg.href} className="flex items-center gap-2">
                      {seg.icon}
                      <span>{seg.label}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          {/* Last segment (current page) */}
          <BreadcrumbItem>
            <BreadcrumbPage className="flex items-center gap-1.5">
              {last.icon}
              <span className={`truncate ${truncateClass}`} title={last.label}>
                {last.label}
              </span>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  // Full breadcrumb trail (desktop or few segments)
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList className="flex-nowrap">
        {/* Leading separator between logo and breadcrumb */}
        {showLeadingSeparator && <BreadcrumbSeparator />}

        {segments.map((segment, index) => {
          return (
            <React.Fragment key={segment.href}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {segment.isCurrentPage ? (
                  <BreadcrumbPage className="flex items-center gap-1.5">
                    {segment.icon}
                    <span className={`truncate ${truncateClass}`} title={segment.label}>
                      {segment.label}
                    </span>
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={segment.href} className="flex items-center gap-1.5">
                      {segment.icon}
                      <span className={`truncate ${truncateClass}`} title={segment.label}>
                        {segment.label}
                      </span>
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
