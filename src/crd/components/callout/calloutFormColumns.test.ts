import { describe, expect, it } from 'vitest';
import { answerDisplayValue, deriveFormColumns } from './calloutFormColumns';

const answer = (questionID: string, prompt: string) => ({ questionID, prompt });

describe('deriveFormColumns', () => {
  it('lists the live questions in order using their current prompt', () => {
    const columns = deriveFormColumns(
      [
        { id: 'a', prompt: 'Renamed A' },
        { id: 'b', prompt: 'B' },
      ],
      [{ answers: [answer('b', 'B'), answer('a', 'Old A')] }]
    );

    expect(columns).toEqual([
      { questionID: 'a', prompt: 'Renamed A', removed: false },
      { questionID: 'b', prompt: 'B', removed: false },
    ]);
  });

  it('appends snapshot-only questions once, in first-appearance order, with the snapshot prompt', () => {
    const columns = deriveFormColumns(
      [{ id: 'live', prompt: 'Live' }],
      [
        { answers: [answer('gone-2', 'Second gone'), answer('live', 'Live')] },
        { answers: [answer('gone-1', 'First gone'), answer('gone-2', 'Second gone (older wording)')] },
      ]
    );

    expect(columns.map(c => [c.questionID, c.prompt, c.removed])).toEqual([
      ['live', 'Live', false],
      ['gone-2', 'Second gone', true],
      ['gone-1', 'First gone', true],
    ]);
  });

  it('keeps the existing order stable when more responses are appended', () => {
    const first = [{ answers: [answer('x', 'X')] }];
    const more = [...first, { answers: [answer('y', 'Y'), answer('x', 'X')] }];
    const before = deriveFormColumns([], first).map(c => c.questionID);
    const after = deriveFormColumns([], more).map(c => c.questionID);
    expect(after.slice(0, before.length)).toEqual(before);
  });

  it('yields only live columns when there are no responses', () => {
    expect(deriveFormColumns([{ id: 'a', prompt: 'A' }], [])).toHaveLength(1);
  });
});

describe('answerDisplayValue', () => {
  it('prefers text, then joined option labels, otherwise undefined', () => {
    const base = { questionID: 'q', prompt: 'P', type: 'SHORT_TEXT' as const, selectedLabels: [] as string[] };
    expect(answerDisplayValue({ ...base, text: ' hi ' })).toBe('hi');
    expect(answerDisplayValue({ ...base, type: 'MULTIPLE_CHOICE', selectedLabels: ['A', 'B'] })).toBe('A, B');
    expect(answerDisplayValue({ ...base, text: '   ' })).toBeUndefined();
    expect(answerDisplayValue(undefined)).toBeUndefined();
  });
});
