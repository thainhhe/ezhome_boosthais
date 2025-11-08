import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminService } from "../../services/adminService";
import useAuthStore from "../../stores/authStore";
import toast from "react-hot-toast";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rawResponse, setRawResponse] = useState(null);
  const currentUser = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers();
      // keep raw response for debugging when empty
      setRawResponse(data);
      // backend may return either an array or an object containing the array
      const list = Array.isArray(data) ? data : data?.users || data?.data || [];
      console.debug(
        "UsersList: fetched users raw response:",
        data,
        "normalized list length:",
        list.length
      );
      setUsers(list);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const changeRole = async (userId, newRole) => {
    try {
      await adminService.updateUser(userId, { role: newRole });
      toast.success("Cập nhật vai trò thành công");
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật vai trò thất bại");
    }
  };

  const removeUser = async (userId) => {
    if (!confirm("Bạn có chắc muốn xóa user này?")) return;
    if (currentUser?._id === userId) {
      toast.error("Không thể xóa chính bạn");
      return;
    }
    try {
      await adminService.deleteUser(userId);
      toast.success("Xóa user thành công");
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Xóa user thất bại");
    }
  };

  return (
    <div className="min-h-screen pt-24 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Users</h2>
          <div>
            <button
              onClick={() => navigate("/admin")}
              className="px-3 py-1 bg-gray-200 rounded mr-2"
            >
              Back
            </button>
            <Link
              to="/admin/rooms"
              className="px-3 py-1 bg-orange-600 text-white rounded"
            >
              Rooms
            </Link>
          </div>
        </div>
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="p-4" colSpan={4}>
                    Loading...
                  </td>
                </tr>
              ) : users && users.length ? (
                users.map((u) => (
                  <tr key={u._id} className="border-t">
                    <td className="p-3">{u.name || "-"}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3 capitalize">{u.role}</td>
                    <td className="p-3">
                      {u.role !== "admin" ? (
                        <button
                          onClick={() => changeRole(u._id, "admin")}
                          className="mr-2 px-3 py-1 bg-indigo-600 text-white rounded"
                        >
                          Make Admin
                        </button>
                      ) : (
                        <button
                          onClick={() => changeRole(u._id, "user")}
                          className="mr-2 px-3 py-1 bg-gray-600 text-white rounded"
                        >
                          Revoke Admin
                        </button>
                      )}
                      <button
                        onClick={() => removeUser(u._id)}
                        className="px-3 py-1 bg-red-600 text-white rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-4" colSpan={4}>
                    No users
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Debug: show raw API response when no users (development only) */}
        {!loading && (!users || users.length === 0) && (
          <div className="mt-4 text-sm text-gray-600">
            <strong>API response:</strong>
            <pre className="mt-2 p-3 bg-gray-100 rounded max-w-full overflow-auto">
              {JSON.stringify(rawResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
