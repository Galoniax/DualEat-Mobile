import { create } from 'zustand';
import { Community } from '@/interface/global';

interface RecentsState {
  community: Community | undefined;
  setCommunity: (community: Community | undefined) => void;
  removeCommunity: () => void;
}

export const useRecentsStore = create<RecentsState>((set) => ({
  community: undefined,
  setCommunity: (community) => set({ community }),
  removeCommunity: () => set({ community: undefined }),
}));