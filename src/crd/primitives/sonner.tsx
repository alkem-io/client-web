import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = (props: ToasterProps) => (
  <Sonner
    theme="light"
    className="toaster group [--normal-bg:var(--popover)] [--normal-text:var(--popover-foreground)] [--normal-border:var(--border)]"
    toastOptions={{
      classNames: {
        error: '!border-l-4 !border-l-destructive',
        success: '!border-l-4 !border-l-success',
        warning: '!border-l-4 !border-l-warning',
        info: '!border-l-4 !border-l-info',
      },
    }}
    {...props}
  />
);

export { Toaster };
