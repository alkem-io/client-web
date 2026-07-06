import { useEffect, useState } from 'react';
import { getBudget } from './assistantApi';
import type { AssistantBudget } from './types';

/**
 * Fetch the signed-in user's monthly budget snapshot for the read-only meter
 * (D1 — T049 / assistant-access-and-budget.md §7). Fed by the
 * **assistant-service** endpoint `GET /api/private/rest/assistant/budget`
 * (asvc T056), reached through the same same-origin, cookie-authenticated edge
 * as the rest of the assistant — no Authorization header, no client enforcement.
 *
 * This is the INITIAL snapshot only (on panel open). The meter then stays live
 * off the `monthToDateUsed` pushed in each `done` SSE event (B / D1) — see the
 * reducer's `done` case + AssistantPanelContent — so no per-turn refetch.
 *
 * Graceful degradation is the contract: the endpoint may not be deployed yet, so
 * a 404 / empty body resolves to `budget: null` and the meter hides itself. Any
 * other failure also leaves `budget` null — the budget is informational, never a
 * gate, so a fetch failure must never block the panel.
 *
 * `enabled` lets the caller defer the fetch until the panel is actually open
 * (so a closed panel never hits the endpoint).
 */
export function useAssistantBudget(enabled: boolean): { budget: AssistantBudget | null; loading: boolean } {
  const [budget, setBudget] = useState<AssistantBudget | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    let cancelled = false;
    setLoading(true);
    getBudget()
      .then(result => {
        if (!cancelled) {
          setBudget(result);
        }
      })
      .catch(() => {
        // Endpoint missing or transient failure → hide the meter; never surface
        // an error in the panel for a purely informational read.
        if (!cancelled) {
          setBudget(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { budget, loading };
}
