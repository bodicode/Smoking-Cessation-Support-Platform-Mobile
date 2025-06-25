export type Blog = {
  id: string;
  title: string;
  content: string;
  slug: string;
  cover_image: string;
  created_at: string;
  author: {
    name: string;
    avatar_url: string;
  } | null;
};
