import {
  CheckCircle2,
  Clock,
  Database,
  Eye,
  FileText,
  Globe,
  type LucideIcon,
  MapPin,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { Button } from '@/crd/primitives/button';
import { Card, CardContent } from '@/crd/primitives/card';

type TransparencyCardBase = {
  id: string;
  iconName: 'eye' | 'database' | 'shieldCheck' | 'globe' | 'mapPin' | 'fileText';
  title: string;
  description: string;
};

type TransparencyBooleanCard = TransparencyCardBase & {
  booleanAnswer: { value: boolean; noIcon?: 'clock' | 'xCircle' };
  textValue?: never;
  action?: never;
};

type TransparencyTextCard = TransparencyCardBase & {
  booleanAnswer?: never;
  textValue: string;
  action?: never;
};

type TransparencyActionCard = TransparencyCardBase & {
  booleanAnswer?: never;
  textValue?: never;
  action: { href: string; label: string };
};

export type TransparencyCardData = TransparencyBooleanCard | TransparencyTextCard | TransparencyActionCard;

export type VCTransparencyCardProps = {
  card: TransparencyCardData;
  labels: {
    yesAnswer: string;
    noAnswer: string;
    unknownAnswer: string;
    notAvailable: string;
  };
};

const ICON_BY_NAME: Record<TransparencyCardData['iconName'], LucideIcon> = {
  eye: Eye,
  database: Database,
  shieldCheck: ShieldCheck,
  globe: Globe,
  mapPin: MapPin,
  fileText: FileText,
};

const NO_ICON_BY_NAME: Record<NonNullable<NonNullable<TransparencyCardData['booleanAnswer']>['noIcon']>, LucideIcon> = {
  clock: Clock,
  xCircle: XCircle,
};

export function VCTransparencyCard({ card, labels }: VCTransparencyCardProps) {
  const TopIcon = ICON_BY_NAME[card.iconName];

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col items-center gap-3 px-6 py-6 text-center">
        <div className="flex size-10 items-center justify-center rounded-full bg-muted">
          <TopIcon className="size-5 text-foreground" aria-hidden="true" />
        </div>
        <h3 className="text-card-title">{card.title}</h3>
        <p className="text-caption text-muted-foreground">{card.description}</p>
        <div className="mt-auto pt-2">
          <AnswerArea card={card} labels={labels} />
        </div>
      </CardContent>
    </Card>
  );
}

function AnswerArea({ card, labels }: { card: TransparencyCardData; labels: VCTransparencyCardProps['labels'] }) {
  if (card.booleanAnswer) {
    const isYes = card.booleanAnswer.value;
    const NoIcon = NO_ICON_BY_NAME[card.booleanAnswer.noIcon ?? 'xCircle'];
    return (
      <div className="flex items-center justify-center gap-2 text-body-emphasis">
        {isYes ? (
          <CheckCircle2 className="size-4 text-foreground" aria-hidden="true" />
        ) : (
          <NoIcon className="size-4 text-muted-foreground" aria-hidden="true" />
        )}
        <span>{isYes ? labels.yesAnswer : labels.noAnswer}</span>
      </div>
    );
  }

  if (card.textValue !== undefined) {
    const value = card.textValue.trim();
    const display =
      value === '' || value.toLowerCase() === 'unknown' || value.toLowerCase() === 'unknown'
        ? labels.unknownAnswer
        : card.textValue;
    return <span className="text-body-emphasis">{display}</span>;
  }

  if (card.action) {
    if (card.action.href === '') {
      return <span className="italic text-caption text-muted-foreground">{labels.notAvailable}</span>;
    }
    return (
      <Button asChild={true} variant="outline" size="sm">
        <a href={card.action.href} target="_blank" rel="noopener noreferrer">
          <FileText className="size-4" aria-hidden="true" />
          {card.action.label}
        </a>
      </Button>
    );
  }

  return null;
}
