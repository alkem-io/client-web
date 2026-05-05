import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * "Coming soon" panel rendered when the Document framing chip would be active.
 * Unreachable today — the Document chip is disabled in `FramingChipStrip` and
 * `calloutFormMapper.framingChipToServer('document')` maps to `None` — but the
 * component exists so the framing switch in `FramingEditorConnector` has a
 * symmetrical branch and, should the chip become enabled, the visual already
 * works (spec FR-22, T013).
 */
export function DocumentFramingPlaceholder() {
  const { t } = useTranslation('crd-space');

  return (
    <div className="p-4 border rounded-xl bg-muted/30 flex items-center gap-3 animate-in fade-in">
      <div
        className="p-2 rounded-lg"
        style={{
          background: 'color-mix(in srgb, var(--muted-foreground) 15%, transparent)',
          color: 'var(--muted-foreground)',
        }}
      >
        <FileText className="w-5 h-5" aria-hidden="true" />
      </div>
      <div>
        <p className="text-body-emphasis">{t('callout.document')}</p>
        <p className="text-caption text-muted-foreground">{t('framing.comingSoon')}</p>
      </div>
    </div>
  );
}
