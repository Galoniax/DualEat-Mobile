import { QRData } from '@/interface/global';
import { create } from 'zustand';

interface OrderState {
  tempOrder: QRData | null; 
  setTempOrder: (order: QRData) => void;
  clearTempOrder: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  tempOrder: null,
  setTempOrder: (order) => set({ tempOrder: order }),
  clearTempOrder: () => set({ tempOrder: null }),
}));


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