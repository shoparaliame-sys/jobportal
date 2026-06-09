import { Routes, Route, Navigate, Outlet } from "react-router";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/useAuth";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import Companies from "./pages/Companies";
import CompanyDetail from "./pages/CompanyDetail";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import SavedJobs from "./pages/SavedJobs";
import CVDatabase from "./pages/CVDatabase";
import CompanyDashboard from "./pages/CompanyDashboard";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

function GlobalLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full" />
    </div>
  );
}

function ProtectedRoute({ children, allowedRoles }: { children?: React.ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role || "")) {
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

function GuestOrRedirectRoute({ children }: { children?: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  
  if (isAuthenticated) {
    if (user?.role === "admin") return <Navigate to="/admin" replace />;
    if (user?.role === "company") return <Navigate to="/company-dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  
  return children ? <>{children}</> : <Outlet />;
}

export default function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <GlobalLoader />;
  }

  return (
    <>
      <Toaster position="bottom-right" richColors />
      <Routes>
        {/* Redirect authenticated users away from these routes */}
        <Route element={<GuestOrRedirectRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login />} />
        </Route>

        {/* Publicly accessible for both guests and logged-in users */}
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/companies/:id" element={<CompanyDetail />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute allowedRoles={["seeker"]} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/saved-jobs" element={<SavedJobs />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["company", "admin"]} />}>
          <Route path="/cvtheque" element={<CVDatabase />} />
          <Route path="/company-dashboard" element={<CompanyDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<Admin />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
