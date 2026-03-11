import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

const isAllowedUrl = (url: string, allowedIFrameOrigins: string[]) => {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.protocol !== 'https:') {
      return false;
    }

    const srcOrigin = parsedUrl.origin;

    return allowedIFrameOrigins.some(vS => vS === srcOrigin);
  } catch (_e) {
    return false;
  }
};

export const remarkVerifyIframe: Plugin<[{ allowedIFrameOrigins?: string[] }]> = ({
  allowedIFrameOrigins = [],
} = {}) => {
  return tree => {
    visit(tree, 'html', (node: { value: string }) => {
      if (node?.value) {
        const nodeValue: string = node.value;
        if (nodeValue.toLowerCase().includes('<iframe')) {
          try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(nodeValue, 'text/html');
            const iframes = doc.querySelectorAll('iframe');
            if (!iframes || !iframes.length) {
              // Cannot find the iframe node after seeing an <iframe, remove the node
              node.value = '';
              return;
            } else {
              for (const iframe of iframes) {
                const src = iframe.getAttribute('src');
                if (!src || !isAllowedUrl(src, allowedIFrameOrigins)) {
                  node.value = '';
                  return;
                }
                if (iframe.getAttribute('sandbox')) {
                  node.value = '';
                  return;
                }
              }
            }
          } catch (_error) {
            // If we can't parse the HTML, just remove the node
            node.value = '';
          }
        }
      }
    });
  };
};
