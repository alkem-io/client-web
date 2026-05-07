import type { ReactNode } from 'react';
import { VCAiEngineGrid, type VCAiEngineSectionData } from './VCAiEngineGrid';
import { VCFunctionalityGrid, type VCFunctionalitySectionData } from './VCFunctionalityGrid';
import { VCMonitoringSection } from './VCMonitoringSection';

export type VCContentViewProps = {
  functionality: VCFunctionalitySectionData;
  /** Pre-rendered Role Requirements paragraph (constructed with `<Trans>` upstream). */
  roleRequirementsContent: ReactNode;
  aiEngine: VCAiEngineSectionData;
  monitoring: {
    heading: string;
    /** Pre-rendered Monitoring body (the integration layer supplies the `<a>` href). */
    body: ReactNode;
  };
  labels: {
    functionalityHeading: string;
    capabilitiesTitle: string;
    dataAccessTitle: string;
    roleRequirementsTitle: string;
    /** Already interpolated with engineName by the mapper (e.g., "AI Engine: Alkemio AI"). */
    aiEngineHeading: string;
    yesAnswer: string;
    noAnswer: string;
    unknownAnswer: string;
    technicalReferencesNotAvailable: string;
  };
};

export function VCContentView({
  functionality,
  roleRequirementsContent,
  aiEngine,
  monitoring,
  labels,
}: VCContentViewProps) {
  return (
    <div className="space-y-10">
      <VCFunctionalityGrid
        functionality={functionality}
        roleRequirementsContent={roleRequirementsContent}
        labels={{
          heading: labels.functionalityHeading,
          capabilitiesTitle: labels.capabilitiesTitle,
          dataAccessTitle: labels.dataAccessTitle,
          roleRequirementsTitle: labels.roleRequirementsTitle,
        }}
      />
      <VCAiEngineGrid
        aiEngine={aiEngine}
        labels={{
          heading: labels.aiEngineHeading,
          yesAnswer: labels.yesAnswer,
          noAnswer: labels.noAnswer,
          unknownAnswer: labels.unknownAnswer,
          notAvailable: labels.technicalReferencesNotAvailable,
        }}
      />
      <VCMonitoringSection heading={monitoring.heading} body={monitoring.body} />
    </div>
  );
}
