export interface Expandable {
  expanded?: boolean;
  onExpand?: () => void;
  onCollapse?: () => void;
}
