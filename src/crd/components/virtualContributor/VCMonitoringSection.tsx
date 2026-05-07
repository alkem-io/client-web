import { Trans, useTranslation } from 'react-i18next';
import { Separator } from '@/crd/primitives/separator';

export type VCMonitoringSectionData = {
  /** Resolved by t() inside the view (e.g., 'crd-profilePages:vcProfile.monitoring.heading'). */
  headingKey: string;
  /** Passed straight to <Trans> with an <a> component (contains <a>...</a> markup). */
  bodyKey: string;
};

export type VCMonitoringSectionProps = {
  monitoring: VCMonitoringSectionData;
};

export function VCMonitoringSection({ monitoring }: VCMonitoringSectionProps) {
  const { t } = useTranslation();
  return (
    <section className="space-y-4">
      <Separator />
      {/* heading + body keys are runtime-supplied (mapper output) so cast to
          bypass the strict literal-key constraint while still resolving via i18next. */}
      <h2 className="text-section-title">
        {/* biome-ignore lint/suspicious/noExplicitAny: runtime-supplied i18n key */}
        {t(monitoring.headingKey as any)}
      </h2>
      <p className="text-body text-muted-foreground">
        <Trans
          // biome-ignore lint/suspicious/noExplicitAny: runtime-supplied i18n key
          i18nKey={monitoring.bodyKey as any}
          components={{
            a: (
              <a
                href="https://welcome.alkem.io/legal/#tc"
                target="_blank"
                rel="noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                {/* href + body provided by the Trans `<a>...</a>` markup */}
              </a>
            ),
          }}
        />
      </p>
    </section>
  );
}
