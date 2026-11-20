import type { LucideIcon } from 'lucide-react';
import { type ReactNode, useId, useRef } from 'react';
import BlueSkyIcon from '@/crd/components/common/icons/social/BlueSky.svg?react';
import GitHubIcon from '@/crd/components/common/icons/social/GitHub.svg?react';
import LinkedInIcon from '@/crd/components/common/icons/social/LinkedIn.svg?react';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';
import { Input } from '@/crd/primitives/input';
import { Label } from '@/crd/primitives/label';

/**
 * Field building blocks shared by the User / Organization / VC Profile tabs
 * (spec 097 Session 2026-10-22): a labelled boxed input with its hint or error,
 * a labelled block for richer editors, the social-link rows and the
 * profile-image card.
 */

/** A field label above any editor, with an optional hint below it. */
export function ProfileFieldBlock({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-body-emphasis">{label}</p>
      {children}
      {hint && <p className="mt-1 text-caption text-muted-foreground">{hint}</p>}
    </div>
  );
}

type ProfileTextFieldProps = {
  label: string;
  hint?: string;
  value: string;
  /** Replaces the hint, in the destructive colour, while the value is invalid. */
  error?: string;
  icon?: LucideIcon;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  onChange?: (next: string) => void;
};

export function ProfileTextField({
  label,
  hint,
  value,
  error,
  icon: Icon,
  placeholder,
  readOnly,
  className,
  onChange,
}: ProfileTextFieldProps) {
  const id = useId();
  const messageId = `${id}-message`;
  const message = error ?? hint;
  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 text-body-emphasis">
        {label}
      </Label>
      <div className="flex items-center gap-2">
        {Icon && <Icon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />}
        <Input
          id={id}
          value={value}
          placeholder={placeholder}
          readOnly={readOnly}
          onChange={onChange ? e => onChange(e.target.value) : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          className={cn('flex-1', readOnly && 'cursor-not-allowed bg-muted/30 text-muted-foreground', className)}
        />
      </div>
      {message && (
        <p id={messageId} className={cn('mt-1 text-caption', error ? 'text-destructive' : 'text-muted-foreground')}>
          {message}
        </p>
      )}
    </div>
  );
}

export type SocialLinkKind = 'linkedin' | 'bsky' | 'github';

export const SOCIAL_LINK_KINDS: ReadonlyArray<SocialLinkKind> = ['linkedin', 'bsky', 'github'];

const SOCIAL_LINKS: Record<SocialLinkKind, { Icon: typeof LinkedInIcon; label: string }> = {
  linkedin: { Icon: LinkedInIcon, label: 'LinkedIn' },
  bsky: { Icon: BlueSkyIcon, label: 'Bluesky' },
  github: { Icon: GitHubIcon, label: 'GitHub' },
};

/** The LinkedIn / Bluesky / GitHub URL rows, each with its brand icon in front. */
export function SocialLinksFields({
  values,
  placeholders,
  onChange,
}: {
  values: Record<SocialLinkKind, string>;
  placeholders: Record<SocialLinkKind, string>;
  onChange: (kind: SocialLinkKind, uri: string) => void;
}) {
  return (
    <div className="space-y-3">
      {SOCIAL_LINK_KINDS.map(kind => {
        const { Icon, label } = SOCIAL_LINKS[kind];
        return (
          <div key={kind} className="flex items-center gap-3">
            <Icon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
            <Input
              className="flex-1"
              value={values[kind]}
              onChange={e => onChange(kind, e.target.value)}
              placeholder={placeholders[kind]}
              aria-label={label}
            />
          </div>
        );
      })}
    </div>
  );
}

type ProfileImageCardBodyProps = {
  imageUrl?: string;
  displayName: string;
  /** `square` for organization logos. */
  shape?: 'round' | 'square';
  /** Rendered under the name, e.g. the organization's verification badge. */
  extra?: ReactNode;
  uploading: boolean;
  changeLabel: string;
  uploadingLabel: string;
  helperText: string;
  onFilePicked: (file: File) => void;
};

/** Body of the profile-image card: the image, the name and the Change button that opens the file picker. */
export function ProfileImageCardBody({
  imageUrl,
  displayName,
  shape = 'round',
  extra,
  uploading,
  changeLabel,
  uploadingLabel,
  helperText,
  onFilePicked,
}: ProfileImageCardBodyProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFilePicked(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <Avatar className={cn('size-24', shape === 'square' && 'rounded-xl')}>
        {imageUrl ? <AvatarImage src={imageUrl} alt="" className="object-cover" /> : null}
        <AvatarFallback className={cn('text-page-title', shape === 'square' && 'rounded-xl')}>
          {(displayName || '??').slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col items-center gap-2">
        <p className="text-body-emphasis">{displayName}</p>
        {extra}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-busy={uploading}
      >
        {uploading ? uploadingLabel : changeLabel}
      </Button>
      <p className="text-caption text-muted-foreground">{helperText}</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif"
        className="hidden"
        onChange={handlePick}
      />
    </div>
  );
}
