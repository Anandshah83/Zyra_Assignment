import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useStudentStore } from "./store/studentStore";
import { Sidebar } from "./components/Sidebar";
import { ActionCenter } from "./components/ActionCenter";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { selectedStudentId } = useStudentStore();

  return (
    <div className="app-shell">
      <header className="topbar">
        <span className="topbar-logo">Zy<span>ra</span></span>
        <div className="topbar-divider" />
        <span className="topbar-subtitle">Counselor Action Center</span>
      </header>

      <Sidebar />

      <main className="main-content">
        <ActionCenter studentId={selectedStudentId} />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
