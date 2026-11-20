import type { CSSProperties } from 'react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

// sonner puts the close button at the inline start (top-left in LTR); we want it top right.
// These three custom properties are its only positioning hook, and they have to be set as an
// inline style rather than a Tailwind utility class: sonner injects its own stylesheet at
// runtime and unlayered, so its `[data-sonner-toaster][dir='ltr']` rule outranks any utility
// class on the same element. An inline style outranks both.
const CLOSE_BUTTON_TOP_RIGHT = {
  '--toast-close-button-start': 'unset',
  '--toast-close-button-end': '0',
  '--toast-close-button-transform': 'translate(35%, -35%)',
} as CSSProperties;

const Toaster = ({ style, toastOptions, ...props }: ToasterProps) => (
  <Sonner
    theme="light"
    closeButton={true}
    className="toaster group [--normal-bg:var(--popover)] [--normal-text:var(--popover-foreground)] [--normal-border:var(--border)]"
    style={{ ...CLOSE_BUTTON_TOP_RIGHT, ...style }}
    toastOptions={{
      ...toastOptions,
      classNames: {
        error: '!border-l-4 !border-l-destructive',
        success: '!border-l-4 !border-l-success',
        warning: '!border-l-4 !border-l-warning',
        info: '!border-l-4 !border-l-info',
        ...toastOptions?.classNames,
      },
    }}
    {...props}
  />
);

export { Toaster };
