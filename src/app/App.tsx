import { useEffect } from "react";
import { Workspace } from "../features/layout/Workspace";
import { useWorkspaceStore } from "../stores/workspaceStore";

export function App() {
  const initialize = useWorkspaceStore((state) => state.initialize);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return <Workspace />;
}
