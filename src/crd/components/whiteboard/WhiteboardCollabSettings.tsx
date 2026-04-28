import { AlertTriangle } from 'lucide-react';
import { useId } from 'react';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Label } from '@/crd/primitives/label';
import { RadioGroup, RadioGroupItem } from '@/crd/primitives/radio-group';

type CollabSettingsOption = {
  value: string;
  label: string;
};

type OwnerProfile = {
  displayName: string;
  avatarUrl?: string;
  /** Optional profile link — when provided, the owner card becomes a link. */
  url?: string;
};

type WhiteboardCollabSettingsProps = {
  title: string;
  description: string;
  ownedByLabel: string;
  owner?: OwnerProfile;
  editableByLabel: string;
  options: CollabSettingsOption[];
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  /** Optional warning rendered above the radio group (e.g. "guest access enabled"). */
  warningMessage?: string;
  className?: string;
};

export function WhiteboardCollabSettings({
  title,
  description,
  ownedByLabel,
  owner,
  editableByLabel,
  options,
  value,
  onChange,
  disabled,
  warningMessage,
  className,
}: WhiteboardCollabSettingsProps) {
  const groupId = useId();

  return (
    <div className={cn('flex flex-col gap-3 w-full', className)}>
      <div className="flex flex-col gap-1">
        <span className="text-body-emphasis text-foreground">{title}</span>
        <span className="text-caption text-muted-foreground">{description}</span>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex flex-1 min-w-0 flex-col gap-2">
          <span className="text-caption text-muted-foreground">{ownedByLabel}</span>
          {owner && <OwnerCard owner={owner} />}
        </div>

        <div className="flex flex-1 min-w-0 flex-col gap-2">
          <span id={groupId} className="text-caption text-muted-foreground">
            {editableByLabel}
          </span>
          {warningMessage && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/10 p-2 text-caption text-foreground"
            >
              <AlertTriangle className="size-4 shrink-0 text-warning" aria-hidden="true" />
              <span>{warningMessage}</span>
            </div>
          )}
          <RadioGroup
            aria-labelledby={groupId}
            value={value}
            onValueChange={onChange}
            disabled={disabled}
            className="gap-2"
          >
            {options.map(option => {
              const itemId = `${groupId}-${option.value}`;
              return (
                <div key={option.value} className="flex items-start gap-2">
                  <RadioGroupItem id={itemId} value={option.value} className="mt-0.5" />
                  <Label htmlFor={itemId} className="text-caption text-foreground font-normal leading-snug">
                    {option.label}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}

function OwnerCard({ owner }: { owner: OwnerProfile }) {
  const initials = owner.displayName
    .split(/\s+/)
    .map(part => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const content = (
    <>
      <Avatar className="size-8">
        {owner.avatarUrl && <AvatarImage src={owner.avatarUrl} alt={owner.displayName} />}
        <AvatarFallback className="text-badge">{initials || '?'}</AvatarFallback>
      </Avatar>
      <span className="text-body-emphasis text-foreground truncate">{owner.displayName}</span>
    </>
  );

  if (owner.url) {
    return (
      <a
        href={owner.url}
        className="flex items-center gap-2 rounded-md p-1 -m-1 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {content}
      </a>
    );
  }

  return <div className="flex items-center gap-2">{content}</div>;
}
