export type EcoverseProject = {
  title: string;
  description?: string;
  caption?: string;
  tag?: {
    status: string;
    text: string;
  };
  type: 'display' | 'more';
  onSelect?: () => void;
};
