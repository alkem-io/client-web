import { VCAiEngineGrid, type VCAiEngineSectionData } from './VCAiEngineGrid';
import { VCFunctionalityGrid, type VCFunctionalitySectionData } from './VCFunctionalityGrid';
import { VCMonitoringSection, type VCMonitoringSectionData } from './VCMonitoringSection';

export type VCContentViewProps = {
  functionality: VCFunctionalitySectionData;
  aiEngine: VCAiEngineSectionData;
  monitoring: VCMonitoringSectionData;
  labels: {
    functionalityHeading: string;
    capabilitiesTitle: string;
    dataAccessTitle: string;
    roleRequirementsTitle: string;
    /** i18n KEY (not resolved) — passed to <Trans> with `<strong>` component. */
    roleRequirementsMemberRequiredKey: string;
    roleRequirementsNoneRequired: string;
    /** Already interpolated with engineName by the mapper (e.g., "AI Engine: Alkemio AI"). */
    aiEngineHeading: string;
    yesAnswer: string;
    noAnswer: string;
    unknownAnswer: string;
    technicalReferencesNotAvailable: string;
  };
};

export function VCContentView({ functionality, aiEngine, monitoring, labels }: VCContentViewProps) {
  return (
    <div className="space-y-10">
      <VCFunctionalityGrid
        functionality={functionality}
        labels={{
          heading: labels.functionalityHeading,
          capabilitiesTitle: labels.capabilitiesTitle,
          dataAccessTitle: labels.dataAccessTitle,
          roleRequirementsTitle: labels.roleRequirementsTitle,
          roleRequirementsMemberRequiredKey: labels.roleRequirementsMemberRequiredKey,
          roleRequirementsNoneRequired: labels.roleRequirementsNoneRequired,
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
      <VCMonitoringSection monitoring={monitoring} />
    </div>
  );
}
