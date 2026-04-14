import type { Editor } from '@tiptap/react';
import { Link } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/crd/primitives/popover';

type ToolbarLinkDialogProps = {
  editor: Editor;
};

export function ToolbarLinkDialog({ editor }: ToolbarLinkDialogProps) {
  const { t } = useTranslation('crd-markdown');
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const isLinkActive = editor.isActive('link');

  const handleOpen = (nextOpen: boolean) => {
    if (nextOpen) {
      const currentHref = editor.getAttributes('link').href ?? '';
      setUrl(currentHref);
      setError('');
    }
    setOpen(nextOpen);
  };

  const validate = (value: string): boolean => {
    if (!value.trim()) {
      setError('');
      return false;
    }
    if (!value.startsWith('http://') && !value.startsWith('https://')) {
      setError(t('editor.link.invalid'));
      return false;
    }
    setError('');
    return true;
  };

  const handleApply = () => {
    if (!validate(url)) return;
    editor.chain().focus().setLink({ href: url.trim() }).run();
    setOpen(false);
  };

  const handleRemove = () => {
    editor.chain().focus().unsetLink().run();
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApply();
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild={true}>
        <button
          type="button"
          className={cn(
            'h-8 w-8 inline-flex items-center justify-center rounded-md transition-colors shrink-0',
            isLinkActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
          )}
          aria-label={t('editor.link')}
          aria-pressed={isLinkActive}
        >
          <Link className="w-4 h-4" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3 space-y-2" align="start">
        <label className="text-xs font-medium text-foreground" htmlFor="toolbar-link-url">
          {t('editor.link.url')}
        </label>
        <input
          id="toolbar-link-url"
          type="url"
          value={url}
          onChange={e => {
            setUrl(e.target.value);
            setError('');
          }}
          onKeyDown={handleKeyDown}
          placeholder={t('editor.link.placeholder')}
          className="w-full h-9 px-3 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          aria-label={t('editor.link.url')}
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
        <div className="flex items-center gap-2 justify-end">
          {isLinkActive && (
            <Button variant="ghost" size="sm" onClick={handleRemove} className="text-destructive">
              {t('editor.link.remove')}
            </Button>
          )}
          <Button size="sm" onClick={handleApply} disabled={!url.trim()}>
            {t('editor.link.apply')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
