import React from 'react';
import {
  Breadcrumbs as MuiBreadcrumbs,
  Link,
  Typography,
  BreadcrumbsProps as MuiBreadcrumbsProps,
} from '@mui/material';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface BreadcrumbsProps extends MuiBreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, ...props }) => {
  return (
    <MuiBreadcrumbs aria-label="breadcrumb" {...props}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return isLast ? (
          <Typography key={index} color="text.primary">
            {item.label}
          </Typography>
        ) : (
          <Link
            key={index}
            underline="hover"
            color="inherit"
            href={item.href}
            onClick={e => {
              if (item.onClick) {
                e.preventDefault();
                item.onClick();
              }
            }}
            style={{ cursor: item.href || item.onClick ? 'pointer' : 'default' }}
          >
            {item.label}
          </Link>
        );
      })}
    </MuiBreadcrumbs>
  );
};
