export interface WhiteboardDetails {
  id: string;
  nameID: string;
  createdDate: Date;
  profile: {
    id: string;
    displayName: string;
    description?: string | undefined;
    visual?: {
      id: string;
      uri: string;
    };
    tagset?: { id: string; tags: string[] };
  };
}
