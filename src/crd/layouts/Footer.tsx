import { Check, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AlkemioLogo } from '@/crd/components/common/AlkemioLogo';
import { cn } from '@/crd/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/crd/primitives/dropdown-menu';

const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Espanol' },
  { code: 'bg', label: 'Български' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Francais' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'uk', label: 'Українська' },
];

export function Footer({ className }: { className?: string }) {
  const { t, i18n } = useTranslation('crd');
  const currentLanguage = i18n.language;

  const currentLabel = SUPPORTED_LANGUAGES.find(l => currentLanguage.startsWith(l.code))?.label ?? 'English';

  return (
    <footer
      className={cn('py-8 px-6 mt-auto', className)}
      style={{
        borderTop: '1px solid var(--border)',
        background: 'var(--card)',
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Copyright */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{t('footer.copyright')}</span>
        </div>

        {/* Links + centered logo */}
        <nav aria-label="Footer" className="flex items-center gap-6 text-sm text-muted-foreground">
          <a
            href="/terms"
            className="hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            {t('footer.terms')}
          </a>
          <a
            href="/privacy"
            className="hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            {t('footer.privacy')}
          </a>
          <a
            href="/security"
            className="hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            {t('footer.security')}
          </a>

          <AlkemioLogo aria-hidden="true" className="w-5 h-5 opacity-40" />

          <a
            href="/support"
            className="hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            {t('footer.support')}
          </a>
          <a
            href="/about"
            className="hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            {t('footer.about')}
          </a>
        </nav>

        {/* Language selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild={true}>
            <button
              type="button"
              className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-accent transition-colors text-sm text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Globe aria-hidden="true" className="w-3.5 h-3.5" />
              <span>{currentLabel}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {SUPPORTED_LANGUAGES.map(lang => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => i18n.changeLanguage(lang.code)}
                className={cn(
                  'flex items-center justify-between cursor-pointer',
                  currentLanguage.startsWith(lang.code) && 'bg-accent'
                )}
              >
                <span className="text-sm">{lang.label}</span>
                {currentLanguage.startsWith(lang.code) && (
                  <Check aria-hidden="true" className="w-4 h-4 shrink-0 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </footer>
  );
}
