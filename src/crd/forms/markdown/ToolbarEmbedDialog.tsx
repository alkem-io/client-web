import type { Editor } from '@tiptap/react';
import { MonitorPlay } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/crd/primitives/dialog';
import { Textarea } from '@/crd/primitives/textarea';
import { isEditorReady } from './isEditorReady';

type ToolbarEmbedDialogProps = {
  editor: Editor;
  /** Allowed iframe origins. When provided, the embed src must match one of them. When empty/undefined, any http(s) iframe is accepted (non-http(s) schemes are always rejected). */
  iframeAllowedUrls?: string[];
  /** Called when user submits an invalid embed (parse failure or disallowed origin). */
  onError?: (message: string) => void;
  disabled?: boolean;
};

export function ToolbarEmbedDialog({ editor, iframeAllowedUrls, onError, disabled }: ToolbarEmbedDialogProps) {
  const { t } = useTranslation('crd-markdown');
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');

  if (!isEditorReady(editor)) return null;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setCode('');
  };

  const handleInsert = () => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(code, 'text/html');
    const iframe = doc.querySelector('iframe');
    if (!iframe) {
      onError?.(t('editor.embed.invalid'));
      return;
    }
    const src = iframe.getAttribute('src');
    if (!src) {
      onError?.(t('editor.embed.invalid'));
      return;
    }
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(src);
    } catch {
      onError?.(t('editor.embed.invalid'));
      return;
    }
    if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
      onError?.(t('editor.embed.invalid'));
      return;
    }
    const origin = parsedUrl.origin;
    if (iframeAllowedUrls && iframeAllowedUrls.length > 0) {
      const allowed = iframeAllowedUrls.some(allowedUrl => allowedUrl === origin);
      if (!allowed) {
        onError?.(t('editor.embed.invalid'));
        return;
      }
    }
    editor.chain().focus().setIframe({ src }).run();
    setOpen(false);
    setCode('');
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild={true}>
        <button
          type="button"
          disabled={disabled}
          className="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors shrink-0 disabled:opacity-40 disabled:pointer-events-none outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          aria-label={t('editor.embed.insert')}
        >
          <MonitorPlay className="w-4 h-4" aria-hidden="true" />
        </button>
      </DialogTrigger>
      <DialogContent className="z-[70] sm:max-w-lg" overlayClassName="z-[70]">
        <DialogHeader>
          <DialogTitle>{t('editor.embed.dialogTitle')}</DialogTitle>
        </DialogHeader>
        <Textarea
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder={t('editor.embed.placeholder')}
          rows={7}
          className="font-mono text-caption"
          aria-label={t('editor.embed.codeLabel')}
          autoFocus={true}
        />
        <DialogFooter>
          <Button variant="ghost" onClick={() => handleOpenChange(false)}>
            {t('editor.cancel')}
          </Button>
          <Button onClick={handleInsert} disabled={!code.trim()}>
            {t('editor.insert')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
