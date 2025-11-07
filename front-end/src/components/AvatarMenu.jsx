import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";

export default function AvatarMenu() {
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  function initials(name) {
    if (!name) return "U";
    return name
      .split(" ")
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  async function doLogout() {
    await logout();
    navigate("/");
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((s) => !s)}
        className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-white"
      >
        <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-sm font-semibold text-white">
          {initials(user?.name || user?.email)}
        </div>
        <div className="hidden sm:block text-sm">
          {user?.name || user?.email}
        </div>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 text-sm overflow-hidden">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full text-left px-3 py-2 hover:bg-slate-100"
          >
            Profile
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full text-left px-3 py-2 hover:bg-slate-100"
          >
            Dashboard
          </button>
          <button
            onClick={doLogout}
            className="w-full text-left px-3 py-2 hover:bg-slate-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
