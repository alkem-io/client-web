import { createContext, PropsWithChildren, useContext } from 'react';
import { SxProps } from '@mui/material';

export interface MarkdownOptions {
  card: boolean;
  plain: boolean;
  multiline: boolean;
  disableParagraphPadding: boolean;
  caption: boolean;
  sx?: SxProps;
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
  return <MarkdownOptionsContext value={options}>{children}</MarkdownOptionsContext>;
};
