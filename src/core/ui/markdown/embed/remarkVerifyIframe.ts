import { Pluggable } from 'unified';
import { visit } from 'unist-util-visit';

import { ALLOWED_EMBED_URLS } from './allowedEmbedUrls';

const isAllowedUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.protocol !== 'https:') {
      return false;
    }

    const srcOrigin = parsedUrl.origin;

    return ALLOWED_EMBED_URLS.some(vS => vS === srcOrigin);
  } catch (e) {
    console.error('Invalid iframe URL:', url, e);

    return false;
  }
};

export const remarkVerifyIframe: Pluggable = () => {
  return tree => {
    visit(tree, 'html', (node: { value: string }) => {
      if (node && typeof node.value === 'string') {
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
              for (let iframe of iframes) {
                const src = iframe.getAttribute('src');
                if (!src || !isAllowedUrl(src)) {
                  node.value = '';
                  return;
                }
                if (iframe.getAttribute('sandbox')) {
                  node.value = '';
                  return;
                }
              }
            }
          } catch (ex) {
            // If we can't parse the HTML, just remove the node
            node.value = '';
          }
        }
      }
    });
  };
};
