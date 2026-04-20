import { createContext, useContext } from "react";

export const SidebarContext = createContext<{ toggle: () => void }>({ toggle: () => {} });

export function useSidebar() {
  return useContext(SidebarContext);
}
