export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string; // For videos or lazy loading
  title?: string;
  description?: string;
  alt?: string;
}
