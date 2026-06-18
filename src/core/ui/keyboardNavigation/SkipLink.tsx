import type { CSSProperties, PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { resolveColor, resolveSx } from '../typography/sx';

type SkipLinkProps = {
  sx?: any;
  anchor?: Element | null | (() => Element | null);
};

// MUI `Button variant="contained" color="primary"` look, reproduced inline.
const CONTAINED_PRIMARY: CSSProperties = {
  backgroundColor: resolveColor('primary.main'),
  color: resolveColor('primary.contrastText'),
  border: 'none',
  borderRadius: '5px',
  padding: '4px 10px',
  fontSize: '0.8125rem',
  fontWeight: 500,
  cursor: 'pointer',
  zIndex: 1,
};

/**
 * Accessibility skip-link. MUI-free replacement for the previous `Button`-based
 * version: visually hidden until focused (`sr-only` / `focus:not-sr-only`,
 * matching the old `visibleOnFocus` behaviour), then shown as a contained
 * primary button.
 */
const SkipLink = ({ anchor, sx, children }: PropsWithChildren<SkipLinkProps>) => {
  const { t } = useTranslation();

  const handleClick = () => {
    const anchorElement = typeof anchor === 'function' ? anchor() : anchor;
    if (!anchorElement) {
      return;
    }
    if (anchorElement.tagName === 'BUTTON' || anchorElement.tagName === 'A') {
      (anchorElement as HTMLButtonElement | HTMLAnchorElement).focus();
    }
    anchorElement.querySelector<HTMLElement>('button, [href], input, [tabindex="0"]')?.focus();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn('sr-only focus:not-sr-only focus:fixed')}
      style={{ ...CONTAINED_PRIMARY, textTransform: 'none', ...resolveSx(sx) }}
    >
      {children ?? t('buttons.skipLink')}
    </button>
  );
};

export default SkipLink;
