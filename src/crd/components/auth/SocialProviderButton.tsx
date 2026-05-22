import { Globe } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/crd/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/crd/primitives/tooltip';

export type SocialProviderButtonProps = {
  /** Display label — used for the tooltip and the accessible name. */
  label: string;
  /** Resolved URL of the provider's brand icon. Falls back to a generic icon when omitted. */
  iconSrc?: string;
  /** Explicit icon node — overrides `iconSrc` (used e.g. for the passkey button). */
  icon?: ReactNode;
  /**
   * When set, the button is a form-submit that carries this name/value pair
   * (the Kratos OIDC node's name + value). Omitted for passkey buttons, which
   * are plain buttons driven by `onClick`.
   */
  formFieldName?: string;
  formFieldValue?: string;
  disabled?: boolean;
  onClick?: () => void;
};

/** 48px circular icon button for an OIDC / passkey sign-in provider. */
export function SocialProviderButton({
  label,
  iconSrc,
  icon,
  formFieldName,
  formFieldValue,
  disabled,
  onClick,
}: SocialProviderButtonProps) {
  const renderedIcon =
    icon ??
    (iconSrc ? (
      <img src={iconSrc} alt="" aria-hidden="true" className="size-5" />
    ) : (
      <Globe aria-hidden="true" className="size-5 text-muted-foreground" />
    ));

  return (
    <Tooltip>
      <TooltipTrigger asChild={true}>
        <button
          type={formFieldName ? 'submit' : 'button'}
          name={formFieldName}
          value={formFieldValue}
          disabled={disabled}
          onClick={onClick}
          aria-label={label}
          className={cn(
            'flex size-12 items-center justify-center rounded-full border border-border bg-card transition-colors',
            'hover:bg-accent outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
            'disabled:pointer-events-none disabled:opacity-50'
          )}
        >
          {renderedIcon}
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
