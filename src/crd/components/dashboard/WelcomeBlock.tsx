import { ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';

type WelcomeBlockProps = {
  message: string;
  welcomeSpaceHref: string;
  documentationHref: string;
  className?: string;
};

/**
 * Friendly welcome shown to authenticated users with no Spaces and nothing
 * pending — points them to the welcome Space and the documentation. Links only,
 * no logic (behaviour is the consumer's; this component just renders anchors).
 */
export function WelcomeBlock({ message, welcomeSpaceHref, documentationHref, className }: WelcomeBlockProps) {
  const { t } = useTranslation('crd-dashboard');

  return (
    <section
      className={cn(
        'flex flex-col items-center gap-4 rounded-lg border border-border bg-card p-8 text-center',
        className
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Sparkles className="size-6" aria-hidden="true" />
      </div>
      <h2 className="text-section-title">{t('welcome.title')}</h2>
      <p className="max-w-prose text-body text-muted-foreground">{message}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <a
          href={welcomeSpaceHref}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-control text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {t('welcome.welcomeSpaceLink')}
          <ArrowRight className="size-4" aria-hidden="true" />
        </a>
        <a
          href={documentationHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-control transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <BookOpen className="size-4" aria-hidden="true" />
          {t('welcome.documentationLink')}
        </a>
      </div>
    </section>
  );
}
