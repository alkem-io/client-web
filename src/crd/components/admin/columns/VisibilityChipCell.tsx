import { Badge } from '@/crd/primitives/badge';

export type VisibilityChipTone = 'default' | 'secondary' | 'destructive' | 'outline';

/**
 * Generic coloured chip for status-style columns (space visibility / privacy
 * mode), mirroring the MUI `VisibilityChipColumn`. The label and tone are
 * resolved by the consumer's data mapper so this stays purely presentational.
 */
export function VisibilityChipCell({ label, tone = 'secondary' }: { label: string; tone?: VisibilityChipTone }) {
  return <Badge variant={tone}>{label}</Badge>;
}
