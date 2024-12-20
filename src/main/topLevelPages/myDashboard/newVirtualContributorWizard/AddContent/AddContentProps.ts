export type PostValues = {
  title: string;
  description: string;
};

export interface PostsFormValues {
  posts: PostValues[];
}

export type AddContentProps = {
  onClose: () => void;
  onCreateVC: (posts: PostsFormValues) => Promise<void>;
};
