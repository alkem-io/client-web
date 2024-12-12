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
    visit(tree, 'html', (node: Node) => {
      // @ts-ignore
      if (typeof node.value === 'string') {
        // @ts-ignore
        const nodeValue: string = node.value;
        if (nodeValue.toLowerCase().includes('<iframe')) {
          const srcMatch = nodeValue.match(/src="([^"]*)"/i);
          if (!srcMatch) {
            // Iframe without src at all? just remove it
            // @ts-ignore
            node.value = '';
          } else if (!isAllowedUrl(srcMatch[1])) {
            // @ts-ignore
            node.value = node.value.replace(/src="[^"]*"/i, 'src="about:blank"');
          }
        }
        const sandboxMatch = nodeValue.match(/sandbox="([^"]*)"/i);
        if (sandboxMatch) {
          // We are not using sandbox attribute for now, so this may be comming from someone trying to tamper with our cookies. Remove the entire thing for now:
          // @ts-ignore
          node.value = '';
        }
      }
    });
  };
};
