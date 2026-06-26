import { Building2, List, Map as MapIcon, User, Users } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Label } from '@/crd/primitives/label';

/**
 * Contributor-collection callout config UI (feature 008, FR-004b/FR-006a/FR-006b).
 * Pure CRD: receives the three options + an onChange and renders the multi-select
 * of contributor types (>=1), the default-type picker (constrained to the
 * selected types), and the default-display (list/map) toggle. All gating /
 * auto-heal logic lives in the consumer mapper; this component only renders and
 * emits the next config.
 */

export type ContributorTypeOption = 'user' | 'organization' | 'virtualContributor';
export type ContributorViewOption = 'list' | 'map';

export type ContributorCollectionConfigValue = {
  types: ContributorTypeOption[];
  defaultType: ContributorTypeOption;
  defaultView: ContributorViewOption;
};

type ContributorCollectionConfigFieldProps = {
  value: ContributorCollectionConfigValue;
  onChange: (next: ContributorCollectionConfigValue) => void;
  /** Validation error (e.g. zero types selected). */
  error?: string;
  disabled?: boolean;
};

const TYPE_ORDER: ContributorTypeOption[] = ['user', 'organization', 'virtualContributor'];

const TYPE_ICON: Record<ContributorTypeOption, ComponentType<SVGProps<SVGSVGElement>>> = {
  user: User,
  organization: Building2,
  virtualContributor: Users,
};

const isLocatable = (type: ContributorTypeOption): boolean => type !== 'virtualContributor';

export function ContributorCollectionConfigField({
  value,
  onChange,
  error,
  disabled = false,
}: ContributorCollectionConfigFieldProps) {
  const { t } = useTranslation('crd-space');

  const toggleType = (type: ContributorTypeOption) => {
    const selected = value.types.includes(type);
    const nextTypes = selected
      ? value.types.filter(tpe => tpe !== type)
      : TYPE_ORDER.filter(tpe => value.types.includes(tpe) || tpe === type);
    // Auto-heal the default type to the first selected when it falls out of the
    // selection; auto-heal the default view to LIST when no locatable type remains.
    const defaultType = nextTypes.includes(value.defaultType) ? value.defaultType : (nextTypes[0] ?? value.defaultType);
    const defaultView = nextTypes.some(isLocatable) ? value.defaultView : 'list';
    onChange({ types: nextTypes, defaultType, defaultView });
  };

  const setDefaultType = (type: ContributorTypeOption) => {
    if (!value.types.includes(type)) return;
    onChange({ ...value, defaultType: type });
  };

  const setDefaultView = (view: ContributorViewOption) => {
    onChange({ ...value, defaultView: view });
  };

  const hasLocatableType = value.types.some(isLocatable);

  return (
    <div className="space-y-4">
      <p className="text-body text-muted-foreground">{t('contributors.config.description')}</p>

      {/* Contributor types (multi-select; >=1 required) */}
      <fieldset className="space-y-2">
        <legend className="text-label text-muted-foreground uppercase">{t('contributors.config.typesLabel')}</legend>
        <div className="flex flex-wrap gap-2">
          {TYPE_ORDER.map(type => {
            const active = value.types.includes(type);
            const Icon = TYPE_ICON[type];
            return (
              <button
                key={type}
                type="button"
                aria-pressed={active}
                disabled={disabled}
                onClick={() => toggleType(type)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-full border text-control font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  active
                    ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
                    : 'bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                <span>{t(`contributors.types.${type}` as 'contributors.types.user')}</span>
              </button>
            );
          })}
        </div>
        <p className="text-caption text-muted-foreground">{t('contributors.config.typesHint')}</p>
        {error && <p className="text-caption text-destructive">{error}</p>}
      </fieldset>

      {/* Default type (constrained to selected types) */}
      {value.types.length > 1 && (
        <div className="space-y-2">
          <Label className="text-label text-muted-foreground uppercase">
            {t('contributors.config.defaultTypeLabel')}
          </Label>
          <div
            className="flex flex-wrap gap-2"
            role="radiogroup"
            aria-label={t('contributors.config.defaultTypeLabel')}
          >
            {TYPE_ORDER.filter(type => value.types.includes(type)).map(type => {
              const active = value.defaultType === type;
              return (
                // biome-ignore lint/a11y/useSemanticElements: styled <button> acting as a radio
                <button
                  key={type}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  disabled={disabled}
                  onClick={() => setDefaultType(type)}
                  className={cn(
                    'px-3 py-1.5 rounded-full border text-control font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    active
                      ? 'bg-primary/10 text-primary border-primary'
                      : 'bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground',
                    disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {t(`contributors.types.${type}` as 'contributors.types.user')}
                </button>
              );
            })}
          </div>
          <p className="text-caption text-muted-foreground">{t('contributors.config.defaultTypeHint')}</p>
        </div>
      )}

      {/* Default display (list/map) — hidden when no locatable type remains. */}
      {hasLocatableType && (
        <div className="space-y-2">
          <Label className="text-label text-muted-foreground uppercase">
            {t('contributors.config.defaultViewLabel')}
          </Label>
          <div className="flex gap-2" role="radiogroup" aria-label={t('contributors.config.defaultViewLabel')}>
            {(['list', 'map'] as const).map(view => {
              const active = value.defaultView === view;
              const Icon = view === 'list' ? List : MapIcon;
              return (
                // biome-ignore lint/a11y/useSemanticElements: styled <button> acting as a radio
                <button
                  key={view}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  disabled={disabled}
                  onClick={() => setDefaultView(view)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-full border text-control font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    active
                      ? 'bg-primary/10 text-primary border-primary'
                      : 'bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground',
                    disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  <span>{view === 'list' ? t('contributors.config.viewList') : t('contributors.config.viewMap')}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
