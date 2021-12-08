export type OpportunityProject = {
  title: string;
  type: 'display' | 'add' | 'more';
  description?: string;
  onSelect?: () => void;
};
