import React, { useState } from "react";
import AuthModal from "./AuthModal";
import useAuthStore from "../stores/authStore";
import AvatarMenu from "./AvatarMenu";

export default function Navbar() {
  // authMode: null | 'login' | 'register'
  const [authMode, setAuthMode] = useState(null);
  const { isAuthenticated } = useAuthStore();

  return (
    // fixed navbar that sits above the hero background
    <nav className="fixed top-0 left-0 right-0 z-20 px-6 py-4 flex items-center justify-between">
      {/* translucent background with subtle blur so background remains visible */}
      <div className="absolute inset-0 pointer-events-none bg-black/20 backdrop-blur-sm"></div>

      <div className="relative z-10 flex items-center gap-3">
        {/* Logo - replace with an <img> if you add a logo file to public */}
        <a href="/" className="flex items-center gap-3 text-white no-underline">
          <div className="w-9 h-9 rounded-md bg-white/20 flex items-center justify-center text-xl font-bold text-white">
            EZ
          </div>
          <span className="hidden sm:inline-block font-semibold">EZ Home</span>
        </a>
      </div>

      <div className="relative z-10 flex items-center gap-3">
        {!isAuthenticated ? (
          <>
            <button
              onClick={() => setAuthMode("register")}
              className="hidden sm:inline-block px-4 py-2 rounded-md border border-white/30 text-white/90 hover:bg-white/10"
            >
              Đăng kí
            </button>

            <button
              onClick={() => setAuthMode("login")}
              className="px-4 py-2 rounded-md bg-teal-600 text-white hover:bg-teal-500"
            >
              Đăng nhập
            </button>
          </>
        ) : (
          <AvatarMenu />
        )}
      </div>

      <AuthModal
        isOpen={!!authMode}
        initialMode={authMode || "login"}
        onClose={() => setAuthMode(null)}
      />
    </nav>
  );
}
