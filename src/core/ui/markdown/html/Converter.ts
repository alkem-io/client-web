export interface Converter {
  markdownToHTML(markdown: string): Promise<string>;
  HTMLToMarkdown(html: string): Promise<string>;
}
