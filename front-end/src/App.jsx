import "./App.css";
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
// import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import Home from "./components/Home";
import Rooms from "./pages/Rooms";
import RoomDetail from "./pages/RoomDetail";
import Bookings from "./pages/Bookings";
import CheckoutPage from "./pages/checkout/CheckoutPage";
import useAuthStore from "./stores/authStore";
import AdminPanel from "./pages/admin/AdminPanel";
import UsersList from "./pages/admin/UsersList";
import BookingsAdmin from "./pages/admin/BookingsAdmin";
import RoomsAdmin from "./pages/admin/RoomsAdmin";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function ProtectedRoute({ children }) {
  const { isAuthenticated, initialized } = useAuthStore();
  if (!initialized) return null;
  return isAuthenticated ? children : <Navigate to="/?auth=login" replace />;
}

function AdminRoute({ children }) {
  const { isAuthenticated, user, initialized } = useAuthStore();
  if (!initialized) return null;
  if (!isAuthenticated) return <Navigate to="/?auth=login" replace />;
  if (!user || user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

function App() {
  const { init } = useAuthStore();
  React.useEffect(() => {
    init();
  }, [init]);
  return (
    <BrowserRouter>
      <div className="App font-sans">
        <Toaster position="top-right" />
        <AppInner />
      </div>
    </BrowserRouter>
  );
}

function AppInner() {
  const location = useLocation();
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/rooms/:id" element={<RoomDetail />} />
        <Route path="/checkout" element={<CheckoutPage />} />
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
          path="/bookings"
          element={
            <ProtectedRoute>
              <Bookings />
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

      {/* show footer on every page except home (path === '/') */}
      {location.pathname !== "/" && <Footer />}
    </>
  );
}

export default App;
