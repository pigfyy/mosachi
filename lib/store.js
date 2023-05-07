import { create } from "zustand";
import { devtools } from "zustand/middleware";

const usePeriodStore = create(
  devtools((set) => ({
    period: {},
    setPeriod: (period) => {
      set({ period });
    },
  }))
);

export default usePeriodStore;
