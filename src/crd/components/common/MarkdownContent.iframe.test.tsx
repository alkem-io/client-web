/**
 * Regression guard for iframe (embedded video) rendering in `MarkdownContent`
 * — used by Post description, post responses, callout framing, etc.
 *
 * The stored markdown form of an embed is a bare `<iframe>` HTML block
 * (see `markdownConverter.ts` → the `iframe` rehype-remark handler). It must
 * survive the read pipeline (remarkVerifyIframe + rehypeRaw passthrough +
 * rehypeSanitize) only when its origin is in the configured allow-list. With
 * no list configured every iframe is stripped (strip-by-default — the platform
 * must whitelist origins); non-https is always stripped.
 */

import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MarkdownConfigProvider } from '@/crd/lib/markdownConfig';
import { MarkdownContent } from './MarkdownContent';

const iframeHtml = (src: string) =>
  `<iframe src="${src}" width="100%" height="100%" frameborder="0" allowfullscreen title="Embedded iframe" loading="lazy"></iframe>`;

const YT = iframeHtml('https://www.youtube.com/embed/dQw4w9WgXcQ');

describe('MarkdownContent — iframe rendering', () => {
  it('renders the iframe when its origin is in the configured allow-list', () => {
    const { container } = render(
      <MarkdownConfigProvider iframeAllowedUrls={['https://www.youtube.com']}>
        <MarkdownContent content={`Intro text\n\n${YT}`} />
      </MarkdownConfigProvider>
    );
    const iframe = container.querySelector('iframe');
    expect(iframe?.getAttribute('src')).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
    expect(container.textContent).toContain('Intro text');
  });

  it('strips every iframe when no origins are configured (strip-by-default)', () => {
    const { container } = render(<MarkdownContent content={`Intro text\n\n${YT}`} />);
    expect(container.querySelector('iframe')).toBeNull();
    expect(container.textContent).toContain('Intro text');
  });

  it('strips an iframe whose origin is not in a configured non-empty allow-list', () => {
    const { container } = render(
      <MarkdownConfigProvider iframeAllowedUrls={['https://player.vimeo.com']}>
        <MarkdownContent content={`Intro text\n\n${YT}`} />
      </MarkdownConfigProvider>
    );
    expect(container.querySelector('iframe')).toBeNull();
    expect(container.textContent).toContain('Intro text');
  });

  it('always strips a non-https iframe, even with no origins configured', () => {
    const { container } = render(<MarkdownContent content={iframeHtml('http://www.youtube.com/embed/x')} />);
    expect(container.querySelector('iframe')).toBeNull();
  });
});
