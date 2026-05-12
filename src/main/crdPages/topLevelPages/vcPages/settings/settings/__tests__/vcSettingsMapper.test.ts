import { describe, expect, it } from 'vitest';
import { computeEngineCardVisibility } from '../vcSettingsMapper';

/**
 * Decision #17 truth table — the orchestrator MUST emit each card
 * conditionally on the engine + BoK type + viewer flags.
 */
describe('computeEngineCardVisibility (Decision #17 engine truth table)', () => {
  const base = { platformAdmin: false, promptGraphEditingEnabled: false } as const;

  it('always shows Visibility (no condition — verified by integration)', () => {
    // Visibility is always rendered by the orchestrator; this function only
    // governs the conditional cards. Sentinel test for the contract.
    const res = computeEngineCardVisibility({ engine: 'alkemio', bodyOfKnowledgeType: undefined, ...base });
    expect(res).toEqual({
      showBodyOfKnowledge: false,
      showPrompt: false,
      showExternalConfig: false,
      showPromptGraphFallback: false,
    });
  });

  it('shows BoK card when bodyOfKnowledgeType is AlkemioSpace', () => {
    expect(
      computeEngineCardVisibility({ engine: 'expert', bodyOfKnowledgeType: 'alkemioSpace', ...base })
        .showBodyOfKnowledge
    ).toBe(true);
  });

  it('shows BoK card when bodyOfKnowledgeType is AlkemioKnowledgeBase', () => {
    expect(
      computeEngineCardVisibility({
        engine: 'expert',
        bodyOfKnowledgeType: 'alkemioKnowledgeBase',
        ...base,
      }).showBodyOfKnowledge
    ).toBe(true);
  });

  it('shows BoK card when engine is Guidance even with no BoK type', () => {
    expect(
      computeEngineCardVisibility({ engine: 'guidance', bodyOfKnowledgeType: undefined, ...base }).showBodyOfKnowledge
    ).toBe(true);
  });

  it('shows Prompt card for GenericOpenai and LibraFlow', () => {
    expect(
      computeEngineCardVisibility({ engine: 'genericOpenai', bodyOfKnowledgeType: undefined, ...base }).showPrompt
    ).toBe(true);
    expect(
      computeEngineCardVisibility({ engine: 'libraFlow', bodyOfKnowledgeType: undefined, ...base }).showPrompt
    ).toBe(true);
  });

  it('hides Prompt card for other engines', () => {
    expect(computeEngineCardVisibility({ engine: 'expert', bodyOfKnowledgeType: undefined, ...base }).showPrompt).toBe(
      false
    );
    expect(
      computeEngineCardVisibility({ engine: 'openaiAssistant', bodyOfKnowledgeType: undefined, ...base }).showPrompt
    ).toBe(false);
  });

  it('shows ExternalConfig for LibraFlow, OpenaiAssistant, GenericOpenai', () => {
    for (const engine of ['libraFlow', 'openaiAssistant', 'genericOpenai'] as const) {
      expect(computeEngineCardVisibility({ engine, bodyOfKnowledgeType: undefined, ...base }).showExternalConfig).toBe(
        true
      );
    }
  });

  it('hides ExternalConfig for engines without external config', () => {
    for (const engine of ['alkemio', 'expert', 'guidance'] as const) {
      expect(computeEngineCardVisibility({ engine, bodyOfKnowledgeType: undefined, ...base }).showExternalConfig).toBe(
        false
      );
    }
  });

  it('shows PromptGraph fallback only for Expert engine AND (platformAdmin OR promptGraphEditingEnabled)', () => {
    // Expert + neither flag → hidden
    expect(
      computeEngineCardVisibility({ engine: 'expert', bodyOfKnowledgeType: undefined, ...base }).showPromptGraphFallback
    ).toBe(false);
    // Expert + platformAdmin → visible
    expect(
      computeEngineCardVisibility({
        engine: 'expert',
        bodyOfKnowledgeType: undefined,
        platformAdmin: true,
        promptGraphEditingEnabled: false,
      }).showPromptGraphFallback
    ).toBe(true);
    // Expert + promptGraphEditingEnabled → visible
    expect(
      computeEngineCardVisibility({
        engine: 'expert',
        bodyOfKnowledgeType: undefined,
        platformAdmin: false,
        promptGraphEditingEnabled: true,
      }).showPromptGraphFallback
    ).toBe(true);
    // Non-expert engine with both flags → hidden (engine must be expert)
    expect(
      computeEngineCardVisibility({
        engine: 'genericOpenai',
        bodyOfKnowledgeType: undefined,
        platformAdmin: true,
        promptGraphEditingEnabled: true,
      }).showPromptGraphFallback
    ).toBe(false);
  });

  it('engine undefined → all conditional cards hidden', () => {
    expect(
      computeEngineCardVisibility({
        engine: undefined,
        bodyOfKnowledgeType: undefined,
        platformAdmin: true,
        promptGraphEditingEnabled: true,
      })
    ).toEqual({
      showBodyOfKnowledge: false,
      showPrompt: false,
      showExternalConfig: false,
      showPromptGraphFallback: false,
    });
  });
});
