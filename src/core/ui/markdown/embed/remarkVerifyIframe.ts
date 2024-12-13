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
          const filters = [
            {
              regex: /src="([^"]*)"/i,
              action: match => {
                if (!nodeValue.includes('src=')) {
                  node.value = ''; // Iframe without src at all? just remove it
                  return;
                }
                if (match && !isAllowedUrl(match[1])) {
                  node.value = nodeValue.replace(/src="[^"]*"/i, 'src="about:blank"');
                }
              },
            },
            {
              // Same as above, but for single quotes
              regex: /src='([^']*)'/i,
              action: match => {
                if (!nodeValue.includes('src=')) {
                  node.value = '';
                  return;
                }
                if (match && !isAllowedUrl(match[1])) {
                  node.value = nodeValue.replace(/src='[^']*'/i, "src='about:blank'");
                }
              },
            },
            {
              // We are not using sandbox attribute for now,
              // so this may be comming from someone trying to tamper with our cookies. Remove the entire thing for now:
              regex: /sandbox/i,
              action: match => {
                if (match) {
                  node.value = '';
                }
              },
            },
          ];
          filters.forEach(filter => filter.action(nodeValue.match(filter.regex)));
        }
      }
    });
  };
};
