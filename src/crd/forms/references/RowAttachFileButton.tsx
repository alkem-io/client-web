import { Loader2, Paperclip } from 'lucide-react';
import { type ChangeEvent, useRef } from 'react';
import { Button } from '@/crd/primitives/button';

type RowAttachFileButtonProps = {
  accept?: string;
  disabled?: boolean;
  uploading: boolean;
  ariaLabel: string;
  onFile: (file: File | undefined) => void;
};

/**
 * Per-row paperclip file-attach button shared by every CRD form that edits a
 * list of links (the two `ReferencesEditor` variants and the callout
 * `LinksPrePopulateRows`). Renders a hidden `<input type="file">` and a
 * spinner while the upload is in flight. The button is purely presentational —
 * the consumer owns the upload mutation and turns the resolved URL into row
 * state.
 */
export function RowAttachFileButton({ accept, disabled, uploading, ariaLabel, onFile }: RowAttachFileButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    onFile(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleChange} />
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled={disabled || uploading}
        aria-busy={uploading}
        aria-label={ariaLabel}
        onClick={() => inputRef.current?.click()}
        className="shrink-0"
      >
        {uploading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Paperclip className="size-4" aria-hidden="true" />
        )}
      </Button>
    </>
  );
}
