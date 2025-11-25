import ReactMarkdown, { Options as ReactMarkdownOptions } from 'react-markdown';
import gfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import components from './components';
import PlainText from './PlainText';
import { MarkdownOptions, MarkdownOptionsProvider } from './MarkdownOptionsContext';
import { Box, BoxProps, SxProps, Theme } from '@mui/material';
import { remarkVerifyIframe } from './embed/remarkVerifyIframe';
import { useConfig } from '@/domain/platform/config/useConfig';
import { gutters } from '@/core/ui/grid/utils';

/**
 * WARNING: About `mdast-util-gfm-autolink-literal` package.
 * We are not using this package directly, but do not remove the dependency from our package.json
 * See client-web/8607
 * An update on this package used by remark-gfm, has introduced a change that causes an error on iPad devices.
 *
 * https://github.com/syntax-tree/mdast-util-gfm-autolink-literal/releases
 * Between version 2.0.0 and 2.0.1 they introduced a regular expression to check email address that is not compatible with iPad browsers (yet).
 * That regex starts with `/(?<=` which is a lookbehind assertion, that causes an error that in the browser console reads like: "invalid group specifier name".
 *
 * For reference, the hierarchy of the packages used is as follows:
 * WrapperMarkdown - This component, used to render pieces of markdown.
 *   react-markdown - The main package for rendering markdown in React, often shortened as "remark".
 *     remark-gfm - A plugin for react-markdown that adds support for GitHub Flavored Markdown (GFM). This adds features like tables, strikethrough, task lists...
 *       mdast-util-gfm - Is a dependency of remark-gfm included in package.json as "^3.0.0"
 *         mdast-util-gfm-autolink-literal - This is the dependency causing issues. mdast-util-gfm includes it in package.json as "^2.0.0".
 *
 * So, as mdast-util-gfm is compatible with any 2.x.x version of mdast-util-gfm-autolink-literal, we want to force npm to use 2.0.0 and not 2.0.1 or higher.
 * They may fix the issue in the future, or Apple may update their browsers to support the regex,
 * so we will have to monitor this and remove the dependency from our package.json when possible.
 */
const allowedNodeTypes = ['iframe'] as const;

const MARKDOWN_CLASS_NAME = 'markdown'; // global styles applied

export interface WrapperMarkdownProps extends ReactMarkdownOptions, Partial<MarkdownOptions> {
  // Do not remove. Even if it's not used directly, React adds a className
  // when using sx, that gets passed to ReactMarkdown and it throws an error
  // because it doesn't support it anymore
  className?: string;
  containerProps?: BoxProps;
}

export const WrapperMarkdown = ({
  card = false,
  plain = false,
  multiline = !plain,
  disableParagraphPadding = card,
  caption = false,
  sx,
  className,
  containerProps,
  ...props
}: WrapperMarkdownProps) => {
  const { integration: { iframeAllowedUrls = [] } = {} } = useConfig();

  const mergedSx: SxProps<Theme> = {
    li: { marginY: caption ? 0 : 1 },
    display: plain ? 'inline' : undefined,
    table: theme => ({ borderCollapse: theme.palette.markdownTable.borderCollapse }),
    tr: theme => ({
      '&:nth-child(odd)': { background: theme.palette.markdownTable.rowBackgroundOdd },
      '&:nth-child(even)': { background: theme.palette.markdownTable.rowBackgroundEven },
    }),
    th: theme => ({
      border: `1px solid ${theme.palette.markdownTable.border}`,
      padding: gutters(0.5)(theme),
    }),
    td: theme => ({
      border: `1px solid ${theme.palette.markdownTable.border}`,
      padding: gutters(0.5)(theme),
      verticalAlign: 'top',
    }),
    ...sx,
  };

  return (
    <MarkdownOptionsProvider
      card={card}
      plain={plain}
      multiline={multiline}
      disableParagraphPadding={disableParagraphPadding}
      caption={caption}
    >
      <Box sx={mergedSx} className={`${MARKDOWN_CLASS_NAME} ${className || ''}`.trim()} {...containerProps}>
        <ReactMarkdown
          components={components}
          remarkPlugins={[
            gfm,
            [PlainText, { enabled: plain }],
            [remarkVerifyIframe, { allowedIFrameOrigins: iframeAllowedUrls }],
          ]}
          rehypePlugins={plain ? undefined : [[rehypeRaw, { passThrough: allowedNodeTypes }]]}
          {...props}
        />
      </Box>
    </MarkdownOptionsProvider>
  );
};

export default WrapperMarkdown;
