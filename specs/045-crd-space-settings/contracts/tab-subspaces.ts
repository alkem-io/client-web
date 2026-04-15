export type SubspaceTile = {
  id: string;
  name: string;
  avatarUrl: string | null;
  memberCount: number;
};

export type SubspacesViewProps = {
  subspaces: SubspaceTile[];
  onCreate: () => void;
  onRename: (id: string, name: string) => void;
  onMove: (id: string, targetParentSpaceId: string) => void;
  onDelete: (id: string) => void;
};
