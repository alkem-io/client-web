import { Pluggable } from 'unified';
import { ALLOWED_EMBED_URLS } from './allowedEmbedUrls';
import { visit } from 'unist-util-visit';

const isAllowedUrl = (url: string) => {
  try {
    const srcOrigin = new URL(url).origin;
    return ALLOWED_EMBED_URLS.some(vS => vS === srcOrigin);
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const remarkVerifyIframe: Pluggable = () => {
  return tree => {
    visit(tree, 'html', (node: Node) => {
      // @ts-ignore
      if (typeof node.value === 'string') {
        // @ts-ignore
        const nodeValue: string = node.value;
        if (nodeValue.toLowerCase().includes('<iframe')) {
          const srcMatch = nodeValue.match(/src="([^"]*)"/);
          if (!srcMatch) {
            // Iframe without src at all? just remove it
            // @ts-ignore
            node.value = '';
          } else if (!isAllowedUrl(srcMatch[1])) {
            // @ts-ignore
            node.value = node.value.replace(/src="[^"]*"/, 'src="about:blank"');
          }
        }
      }
    });
  };
};
