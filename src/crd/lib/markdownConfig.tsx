import { createContext, type ReactNode, useContext } from 'react';

type MarkdownConfig = {
  iframeAllowedUrls: string[];
};

const MarkdownConfigContext = createContext<MarkdownConfig>({
  iframeAllowedUrls: [],
});

export function MarkdownConfigProvider({ iframeAllowedUrls, children }: MarkdownConfig & { children: ReactNode }) {
  return <MarkdownConfigContext value={{ iframeAllowedUrls }}>{children}</MarkdownConfigContext>;
}

export function useMarkdownConfig(): MarkdownConfig {
  return useContext(MarkdownConfigContext);
}
