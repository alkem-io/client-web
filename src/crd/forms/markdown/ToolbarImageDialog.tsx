import type { Editor } from '@tiptap/react';
import { Image as ImageIcon, Loader2, Upload } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/crd/primitives/dialog';
import { Input } from '@/crd/primitives/input';
import { Label } from '@/crd/primitives/label';
import { isEditorReady } from './isEditorReady';

type ToolbarImageDialogProps = {
  editor: Editor;
  /** When provided, the dialog shows an upload button. Should return a public URL. */
  onImageUpload?: (file: File) => Promise<string>;
  onError?: (message: string) => void;
};

export function ToolbarImageDialog({ editor, onImageUpload, onError }: ToolbarImageDialogProps) {
  const { t } = useTranslation('crd-markdown');
  const [open, setOpen] = useState(false);
  const [src, setSrc] = useState('');
  const [alt, setAlt] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const srcInputId = useId();
  const altInputId = useId();

  if (!isEditorReady(editor)) return null;

  const reset = () => {
    setSrc('');
    setAlt('');
    setUploading(false);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) reset();
  };

  const handleInsert = () => {
    const trimmed = src.trim();
    if (!trimmed) return;
    if (!/^https?:\/\//i.test(trimmed)) {
      onError?.(t('editor.image.invalidUrl'));
      return;
    }
    editor.chain().focus().setImage({ src: trimmed, alt: alt.trim() }).run();
    setOpen(false);
    reset();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImageUpload) return;
    setUploading(true);
    try {
      const url = await onImageUpload(file);
      setSrc(url);
    } catch (err) {
      onError?.(err instanceof Error ? err.message : t('editor.image.uploadError'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild={true}>
        <button
          type="button"
          className="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          aria-label={t('editor.image.insert')}
        >
          <ImageIcon className="w-4 h-4" aria-hidden="true" />
        </button>
      </DialogTrigger>
      <DialogContent className="z-[70] sm:max-w-md" overlayClassName="z-[70]">
        <DialogHeader>
          <DialogTitle>{t('editor.image.dialogTitle')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor={srcInputId}>{t('editor.image.url')}</Label>
            <Input
              id={srcInputId}
              type="url"
              value={src}
              onChange={e => setSrc(e.target.value)}
              placeholder={t('editor.link.placeholder')}
              disabled={uploading}
            />
          </div>
          {onImageUpload && (
            <>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                aria-busy={uploading}
                className="w-full"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" aria-hidden="true" />
                )}
                {uploading ? t('editor.image.uploading') : t('editor.image.uploadFile')}
              </Button>
            </>
          )}
          <div className="space-y-1">
            <Label htmlFor={altInputId}>{t('editor.image.alt')}</Label>
            <Input
              id={altInputId}
              value={alt}
              onChange={e => setAlt(e.target.value)}
              placeholder={t('editor.image.altPlaceholder')}
              disabled={uploading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => handleOpenChange(false)} disabled={uploading}>
            {t('editor.cancel')}
          </Button>
          <Button onClick={handleInsert} disabled={uploading || !src.trim()}>
            {t('editor.insert')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
