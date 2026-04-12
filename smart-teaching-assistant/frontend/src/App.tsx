import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/Landing";

import Index from "./pages/Index";
import UploadPage from "./pages/UploadPage";
import LessonsPage from "./pages/LessonsPage";
import VoicePage from "./pages/VoicePage";
import ActionsPage from "./pages/ActionsPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

/* =========================
AUTH ROUTES
========================= */

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
const token = localStorage.getItem("token");

if (!token) {
return <Navigate to="/login" replace />;
}

return children;
};

const AdminRoute = ({ children }: { children: JSX.Element }) => {
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user") || "{}");

if (!token) {
return <Navigate to="/login" replace />;
}

if (user?.role !== "admin") {
return <Navigate to="/dashboard" replace />;
}

return children;
};

const PublicRoute = ({ children }: { children: JSX.Element }) => {
const token = localStorage.getItem("token");

if (token) {
return <Navigate to="/dashboard" replace />;
}

return children;
};

/* =========================
APP
========================= */

const App = () => ( <QueryClientProvider client={queryClient}> <TooltipProvider> <Toaster /> <Sonner />

```
  <BrowserRouter>

    <Routes>

      {/* LANDING PAGE */}
      <Route path="/" element={<Landing />} />

      {/* LOGIN */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* DASHBOARD */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        }
      />

      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <UploadPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/lessons"
        element={
          <ProtectedRoute>
            <LessonsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/voice"
        element={
          <ProtectedRoute>
            <VoicePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/actions"
        element={
          <ProtectedRoute>
            <ActionsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* ADMIN ROUTE */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        }
      />

      <Route path="*" element={<NotFound />} />

    </Routes>

  </BrowserRouter>
</TooltipProvider>
```

  </QueryClientProvider>
);

export default App;
