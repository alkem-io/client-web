export interface CalloutSortEvents {
  onMoveUp: (calloutId: string) => void;
  onMoveDown: (calloutId: string) => void;
  onMoveToTop: (calloutId: string) => void;
  onMoveToBottom: (calloutId: string) => void;
}

export interface CalloutSortProps {
  topCallout: boolean;
  bottomCallout: boolean;
}
