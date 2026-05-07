import { type TransparencyCardData, VCTransparencyCard } from './VCTransparencyCard';

export type VCAiEngineSectionData = {
  /** Already interpolated by the mapper (e.g., "Alkemio AI"). */
  engineName: string;
  /** Always exactly six entries in fixed prototype order. */
  cards: TransparencyCardData[];
};

export type VCAiEngineGridProps = {
  aiEngine: VCAiEngineSectionData;
  labels: {
    /** Already interpolated with engineName by the mapper, e.g., "AI Engine: Alkemio AI". */
    heading: string;
    yesAnswer: string;
    noAnswer: string;
    unknownAnswer: string;
    notAvailable: string;
  };
};

export function VCAiEngineGrid({ aiEngine, labels }: VCAiEngineGridProps) {
  return (
    <section>
      <h2 className="text-section-title mb-4">{labels.heading}</h2>
      {/* biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style */}
      {/* biome-ignore lint/a11y/useSemanticElements: role="list" needed to restore semantics after Tailwind reset */}
      <ul role="list" className="grid grid-cols-1 md:grid-cols-3 gap-4 list-none p-0 m-0">
        {aiEngine.cards.map(card => (
          <li key={card.id}>
            <VCTransparencyCard
              card={card}
              labels={{
                yesAnswer: labels.yesAnswer,
                noAnswer: labels.noAnswer,
                unknownAnswer: labels.unknownAnswer,
                notAvailable: labels.notAvailable,
              }}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
