import { describe, expect, it } from 'vitest';
import { computeEngineCardVisibility } from '../vcSettingsMapper';

/**
 * Decision #17 truth table — the orchestrator MUST emit each card
 * conditionally on the engine + BoK type.
 */
describe('computeEngineCardVisibility (Decision #17 engine truth table)', () => {
  it('always shows Visibility (no condition — verified by integration)', () => {
    // Visibility is always rendered by the orchestrator; this function only
    // governs the conditional cards. Sentinel test for the contract.
    const res = computeEngineCardVisibility({ engine: 'alkemio', bodyOfKnowledgeType: undefined });
    expect(res).toEqual({
      showBodyOfKnowledge: false,
      showPrompt: false,
      showExternalConfig: false,
    });
  });

  it('shows BoK card when bodyOfKnowledgeType is AlkemioSpace', () => {
    expect(
      computeEngineCardVisibility({ engine: 'expert', bodyOfKnowledgeType: 'alkemioSpace' }).showBodyOfKnowledge
    ).toBe(true);
  });

  it('shows BoK card when bodyOfKnowledgeType is AlkemioKnowledgeBase', () => {
    expect(
      computeEngineCardVisibility({
        engine: 'expert',
        bodyOfKnowledgeType: 'alkemioKnowledgeBase',
      }).showBodyOfKnowledge
    ).toBe(true);
  });

  it('shows BoK card when engine is Guidance even with no BoK type', () => {
    expect(
      computeEngineCardVisibility({ engine: 'guidance', bodyOfKnowledgeType: undefined }).showBodyOfKnowledge
    ).toBe(true);
  });

  it('shows Prompt card for GenericOpenai and LibraFlow', () => {
    expect(computeEngineCardVisibility({ engine: 'genericOpenai', bodyOfKnowledgeType: undefined }).showPrompt).toBe(
      true
    );
    expect(computeEngineCardVisibility({ engine: 'libraFlow', bodyOfKnowledgeType: undefined }).showPrompt).toBe(true);
  });

  it('hides Prompt card for other engines', () => {
    expect(computeEngineCardVisibility({ engine: 'expert', bodyOfKnowledgeType: undefined }).showPrompt).toBe(false);
    expect(computeEngineCardVisibility({ engine: 'openaiAssistant', bodyOfKnowledgeType: undefined }).showPrompt).toBe(
      false
    );
  });

  it('shows ExternalConfig for LibraFlow, OpenaiAssistant, GenericOpenai', () => {
    for (const engine of ['libraFlow', 'openaiAssistant', 'genericOpenai'] as const) {
      expect(computeEngineCardVisibility({ engine, bodyOfKnowledgeType: undefined }).showExternalConfig).toBe(true);
    }
  });

  it('hides ExternalConfig for engines without external config', () => {
    for (const engine of ['alkemio', 'expert', 'guidance'] as const) {
      expect(computeEngineCardVisibility({ engine, bodyOfKnowledgeType: undefined }).showExternalConfig).toBe(false);
    }
  });

  it('engine undefined → all conditional cards hidden', () => {
    expect(
      computeEngineCardVisibility({
        engine: undefined,
        bodyOfKnowledgeType: undefined,
      })
    ).toEqual({
      showBodyOfKnowledge: false,
      showPrompt: false,
      showExternalConfig: false,
    });
  });
});
