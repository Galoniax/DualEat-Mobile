import { QROrderPayload } from '@/interface/global';
import { create } from 'zustand';

interface OrderState {
  tempOrder: QROrderPayload | null; 
  setTempOrder: (order: QROrderPayload) => void; // Borrado automatico al resetear el state
  clearTempOrder: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  tempOrder: null,
  setTempOrder: (order) => set({ tempOrder: order }),
  clearTempOrder: () => set({ tempOrder: null }),
}));


// TODO: 
/*interface OrderState {
  tempOrder: string | null; 
  setTempOrder: (order: string) => void; // Borrado automatico al resetear el state
  clearTempOrder: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  tempOrder: null,
  setTempOrder: (order) => set({ tempOrder: order }),
  clearTempOrder: () => set({ tempOrder: null }),
}));
*/