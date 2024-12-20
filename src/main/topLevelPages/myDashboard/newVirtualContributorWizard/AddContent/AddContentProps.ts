export type PostValues = {
  title: string;
  description: string;
};

export interface DocumentValues {
  name: string;
  url: string;
}

export interface BoKCalloutsFormValues {
  posts: PostValues[];
  documents: DocumentValues[];
}

export type AddContentProps = {
  onClose: () => void;
  onCreateVC: (values: BoKCalloutsFormValues) => Promise<void>;
  spaceId: string;
};
