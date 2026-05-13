import { create } from 'zustand';
import { PostDTO } from '@/interface/global.dto';

interface PostCreateState {
  post: PostDTO;
  setPost: (post: PostDTO) => void;
  clearPost: () => void;
}

export const usePostCreateStore = create<PostCreateState>((set) => ({
  post: {
    title: "",
    content: "",
    image_urls: [],
    community_id: null,
  },
  setPost: (post) => set({ post }),
  clearPost: () => set({ post: { title: "", content: "", image_urls: [], community_id: null } }),
}));