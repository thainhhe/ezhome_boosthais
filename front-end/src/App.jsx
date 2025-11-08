import "./App.css";
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
// import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import Home from "./components/Home";
import useAuthStore from "./stores/authStore";
import AdminPanel from "./pages/admin/AdminPanel";
import UsersList from "./pages/admin/UsersList";
import BookingsAdmin from "./pages/admin/BookingsAdmin";
import RoomsAdmin from "./pages/admin/RoomsAdmin";
import Navbar from "./components/Navbar";

function ProtectedRoute({ children }) {
  const { isAuthenticated, initialized } = useAuthStore();
  // Wait until auth is initialized before deciding to redirect - prevents flash/redirect on reload
  if (!initialized) return null;
  // If not authenticated, send user to home with auth modal query so modal opens there
  return isAuthenticated ? children : <Navigate to="/?auth=login" replace />;
}

function AdminRoute({ children }) {
  const { isAuthenticated, user, initialized } = useAuthStore();
  // don't redirect away while we're still initializing auth on page load
  if (!initialized) return null;
  if (!isAuthenticated) return <Navigate to="/?auth=login" replace />;
  if (!user || user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

function App() {
  const { init } = useAuthStore();
  // attempt to rehydrate auth on app mount
  React.useEffect(() => {
    init();
  }, [init]);
  return (
    <BrowserRouter>
      <div className="App font-sans">
        <Toaster position="top-right" />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/login" element={<Login />} /> */}
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <UsersList />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <AdminRoute>
                <BookingsAdmin />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/rooms"
            element={
              <AdminRoute>
                <RoomsAdmin />
              </AdminRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
