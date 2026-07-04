import { createContext, useContext } from "react";

export const DemoContext = createContext({ isDemoMode: false });

export function useDemoMode() {
  return useContext(DemoContext);
}
