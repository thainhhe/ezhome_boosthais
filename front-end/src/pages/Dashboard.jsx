import React, { useEffect } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import { authService } from "../services/authService";
import toast from "react-hot-toast";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, loadProfile } = useAuthStore();
  const [profileData, setProfileData] = React.useState(null);
  const [dashboardData, setDashboardData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      // go to home and open login modal
      navigate("/?auth=login");
      return;
    }
    loadUserData();
  }, [isAuthenticated, navigate]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Load profile
      const profile = await authService.getProfile();
      setProfileData(profile);

      // Load dashboard
      const dashboard = await authService.getDashboard();
      setDashboardData(dashboard);
    } catch (error) {
      toast.error("Không thể tải dữ liệu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Đã đăng xuất");
    // after logout redirect to home and open login modal
    navigate("/?auth=login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Content - add top padding so fixed navbar doesn't overlap */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Thông tin Profile
            </h2>
            {profileData && (
              <div className="space-y-2">
                <p className="text-gray-600">
                  <span className="font-medium">Message:</span>{" "}
                  {profileData.message}
                </p>
                {profileData.user && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">User ID:</span>{" "}
                      {profileData.user.userId}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Email:</span>{" "}
                      {profileData.user.email}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dashboard Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Dashboard Data
            </h2>
            {dashboardData && (
              <div className="space-y-2">
                <p className="text-gray-600">
                  <span className="font-medium">Message:</span>{" "}
                  {dashboardData.message}
                </p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">User ID:</span>{" "}
                    {dashboardData.userId}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Email:</span>{" "}
                    {dashboardData.email}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* User Info Card */}
          <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Thông tin User
            </h2>
            {user && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">ID</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {user.id || "N/A"}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {user.email || "N/A"}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {user.name || "N/A"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
