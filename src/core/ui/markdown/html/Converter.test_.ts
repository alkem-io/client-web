import UnifiedConverter from './UnifiedConverter';

describe('HTML to Markdown', () => {
  const { HTMLToMarkdown } = UnifiedConverter();

  test('Preserves multiple line breaks', async () => {
    const html = '<p>One</p><p></p><p></p><p></p><p>Two</p>';
    expect(await HTMLToMarkdown(html)).toEqual('One\n\n<br>\n\n<br>\n\n<br>\n\nTwo\n');
  });
});

describe('Markdown to HTML', () => {
  const { markdownToHTML } = UnifiedConverter();

  test('Converts multiple line breaks to empty paragraphs', async () => {
    const markdown = 'One\n\n<br>\n\n<br>\n\n<br>\n\nTwo\n';
    const html = (await markdownToHTML(markdown)).split('\n').join('');
    expect(html).toEqual('<p>One</p><p></p><p></p><p></p><p>Two</p>');
  });
});
