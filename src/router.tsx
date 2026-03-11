import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

const LoginPage = lazy(() =>
  import("./features/auth/pages/LoginPage").then((m) => ({ default: m.LoginPage }))
);
const KanbanPage = lazy(() =>
  import("./features/kanban/pages/KanbanPage").then((m) => ({ default: m.KanbanPage }))
);
const ProjectDetailPage = lazy(() =>
  import("./features/projects/pages/ProjectDetailPage").then((m) => ({
    default: m.ProjectDetailPage,
  }))
);
const ProjectNewPage = lazy(() =>
  import("./features/projects/pages/ProjectNewPage").then((m) => ({
    default: m.ProjectNewPage,
  }))
);
const ArchivedProjectsPage = lazy(() =>
  import("./features/projects/pages/ArchivedProjectsPage").then((m) => ({
    default: m.ArchivedProjectsPage,
  }))
);
const ClientsPage = lazy(() =>
  import("./features/clients/pages/ClientsPage").then((m) => ({ default: m.ClientsPage }))
);
const ClientDetailPage = lazy(() =>
  import("./features/clients/pages/ClientDetailPage").then((m) => ({
    default: m.ClientDetailPage,
  }))
);
const DashboardPage = lazy(() =>
  import("./features/dashboard/pages/DashboardPage").then((m) => ({
    default: m.DashboardPage,
  }))
);
const InvoicesPage = lazy(() =>
  import("./features/invoices/pages/InvoicesPage").then((m) => ({ default: m.InvoicesPage }))
);
const InvoiceNewPage = lazy(() =>
  import("./features/invoices/pages/InvoiceNewPage").then((m) => ({ default: m.InvoiceNewPage }))
);
const InvoiceDetailPage = lazy(() =>
  import("./features/invoices/pages/InvoiceDetailPage").then((m) => ({
    default: m.InvoiceDetailPage,
  }))
);

const ProtectedRoute = lazy(() =>
  import("./features/auth/components/ProtectedRoute").then((m) => ({
    default: m.ProtectedRoute,
  }))
);
const AppLayout = lazy(() =>
  import("./components/layout/AppLayout").then((m) => ({ default: m.AppLayout }))
);

function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

export function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<KanbanPage />} />
          <Route path="projects/new" element={<ProjectNewPage />} />
          <Route path="projects/archived" element={<ArchivedProjectsPage />} />
          <Route path="projects/:id" element={<ProjectDetailPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="clients/:id" element={<ClientDetailPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="invoices/:id" element={<InvoiceDetailPage />} />
          <Route path="invoice/new" element={<InvoiceNewPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
