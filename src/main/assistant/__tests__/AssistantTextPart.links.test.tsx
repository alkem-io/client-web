import { render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { AssistantTextPart } from '../AssistantTextPart';

describe('AssistantTextPart links', () => {
  const linkIn = (text: string) => render(<AssistantTextPart text={text} />).container.querySelector('a');

  test.each([
    ['external', '[x](https://example.com/a)'],
    ['bare external URL', 'https://example.com/a'],
    ['protocol-relative', '[x](//example.com/a)'],
  ])('%s link opens in a new tab', (_name, text) => {
    const link = linkIn(text);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test.each([
    ['same-origin', `[x](${window.location.origin}/space/a)`],
    ['relative', '[x](/space/a)'],
    ['fragment', '[x](#section)'],
    ['mailto', '[x](mailto:a@example.com)'],
    ['unparseable', '[x](http://)'],
  ])('%s link stays in the current tab', (_name, text) => {
    const link = linkIn(text);
    expect(link).toHaveAttribute('href');
    expect(link).not.toHaveAttribute('target');
    expect(link).not.toHaveAttribute('rel');
  });
});
