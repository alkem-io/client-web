import UnifiedConverter from './DefaultConverter';

describe('HTML to Markdown', () => {
  const { HTMLToMarkdown } = UnifiedConverter();

  test('Preserves multiple empty paragraphs', async () => {
    const html = '<p>One</p><p></p><p></p><p></p><p>Two</p>';
    expect(await HTMLToMarkdown(html)).toEqual('One\n\n<p></p>\n\n<p></p>\n\n<p></p>\n\nTwo\n');
  });
});

describe('Markdown to HTML', () => {
  const { markdownToHTML } = UnifiedConverter();

  test('Preserves multiple empty paragraphs to a sequence of back slashes', async () => {
    const markdown = 'One\n\n<p></p>\n\n<p></p>\n\n<p></p>\n\nTwo\n';
    const html = (await markdownToHTML(markdown)).split('\n').join('');
    expect(html).toEqual('<p>One</p><p></p><p></p><p></p><p>Two</p>');
  });
});
