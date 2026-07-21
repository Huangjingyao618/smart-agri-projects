/**
 * 设备数据状态管理 (Zustand)
 */
import { create } from 'zustand';
import type { DeviceData, ConnectStatus } from '@/types/device';

interface DeviceState {
  data: DeviceData;
  status: ConnectStatus;
  updateData: (partial: Partial<DeviceData>) => void;
  setStatus: (status: ConnectStatus) => void;
}

const DEFAULT_DATA: DeviceData = {
  temp: 0,
  humidity: 0,
  LED1: false,
  LED2: false,
  timestamp: 0,
};

export const useDeviceStore = create<DeviceState>((set) => ({
  data: { ...DEFAULT_DATA },
  status: 'disconnected',

  updateData: (partial) =>
    set((state) => ({
      data: { ...state.data, ...partial },
    })),

  setStatus: (status) => set({ status }),
}));