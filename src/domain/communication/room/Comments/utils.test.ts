import { findCursorPositionInMarkdown } from './utils';
import { expect, test } from 'vitest';

test('finds the position in pure plain text string', () => {
  const { markdown } = findCursorPositionInMarkdown('Pure text string', 7);
  expect(markdown).toEqual(7);
});

test('finds the position before the mention', () => {
  const { markdown } = findCursorPositionInMarkdown('Some text before mentioning [@Matthew](https://...)', 7);
  expect(markdown).toEqual(7);
});

test('finds the position inside the 1st mention', () => {
  const { markdown } = findCursorPositionInMarkdown('Some text before mentioning [@Matthew](https://...)', 34);
  expect(markdown).toEqual(34);
});

test('finds the position in between the 1st and the 2nd mention', () => {
  const { markdown } = findCursorPositionInMarkdown(
    'Some text before mentioning [@Matthew](https://...) and some before [@Ricardo](https://...)',
    45
  );
  expect(markdown).toEqual(60);
});

test('finds the position inside the 2nd mention', () => {
  const { markdown } = findCursorPositionInMarkdown(
    'Some text before mentioning [@Matthew](https://...) and some before [@Ricardo](https://...)',
    60
  );
  expect(markdown).toEqual(75);
});
