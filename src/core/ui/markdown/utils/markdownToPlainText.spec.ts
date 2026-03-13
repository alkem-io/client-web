import { describe, expect, it } from 'vitest';
import { markdownToPlainText } from './markdownToPlainText';

describe('markdownToPlainText', () => {
  it('should convert simple text without markdown', () => {
    const markdown = 'This is plain text';
    const result = markdownToPlainText(markdown);
    expect(result).toBe('This is plain text');
  });

  it('should strip bold formatting', () => {
    const markdown = 'This is **bold** text';
    const result = markdownToPlainText(markdown);
    expect(result).toBe('This is bold text');
  });

  it('should strip italic formatting', () => {
    const markdown = 'This is *italic* text';
    const result = markdownToPlainText(markdown);
    expect(result).toBe('This is italic text');
  });

  it('should strip links but keep text', () => {
    const markdown = 'Check out [this link](https://example.com)';
    const result = markdownToPlainText(markdown);
    expect(result).toBe('Check out this link');
  });

  it('should convert headings to plain text', () => {
    const markdown = '# Heading 1\n\nSome text\n\n## Heading 2';
    const result = markdownToPlainText(markdown);
    expect(result).toContain('Heading 1');
    expect(result).toContain('Heading 2');
    expect(result).toContain('Some text');
  });

  it('should convert lists to plain text with markers', () => {
    const markdown = '- Item 1\n- Item 2\n- Item 3';
    const result = markdownToPlainText(markdown);
    expect(result).toContain('Item 1');
    expect(result).toContain('Item 2');
    expect(result).toContain('Item 3');
  });

  it('should preserve inline code content', () => {
    const markdown = 'Use the `code` function';
    const result = markdownToPlainText(markdown);
    expect(result).toBe('Use the code function');
  });

  it('should preserve code block content', () => {
    const markdown = '```\nconst x = 1;\n```';
    const result = markdownToPlainText(markdown);
    expect(result).toContain('const x = 1;');
  });

  it('should handle mixed markdown content', () => {
    const markdown =
      '# Event Description\n\n**When**: Tomorrow\n\n*Where*: Office\n\n- Bring laptop\n- Bring notes\n\nMore info: [link](https://example.com)';
    const result = markdownToPlainText(markdown);
    expect(result).toContain('Event Description');
    expect(result).toContain('When: Tomorrow');
    expect(result).toContain('Where: Office');
    expect(result).toContain('Bring laptop');
    expect(result).toContain('Bring notes');
    expect(result).toContain('More info: link');
  });

  it('should handle empty string', () => {
    const markdown = '';
    const result = markdownToPlainText(markdown);
    expect(result).toBe('');
  });

  it('should normalize multiple newlines', () => {
    const markdown = 'Line 1\n\n\n\nLine 2';
    const result = markdownToPlainText(markdown);
    expect(result).not.toContain('\n\n\n');
  });
});
