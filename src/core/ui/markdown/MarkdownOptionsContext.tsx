import { createContext, PropsWithChildren, useContext } from 'react';

export interface MarkdownOptions {
  card: boolean;
  flat: boolean;
  multiline: boolean;
}

const MarkdownOptionsContext = createContext<MarkdownOptions | undefined>(undefined);

export const useMarkdownOptions = () => {
  const options = useContext(MarkdownOptionsContext);
  if (!options) {
    throw new Error('Not within MarkdownOptionsProvider');
  }
  return options;
};

export const MarkdownOptionsProvider = ({ children, ...options }: PropsWithChildren<MarkdownOptions>) => {
  return <MarkdownOptionsContext.Provider value={options}>{children}</MarkdownOptionsContext.Provider>;
};
