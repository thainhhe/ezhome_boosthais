import React, { useState, useEffect } from "react";
import RoomCard from "./RoomCard";
import Navbar from "./Navbar";
import Dashboard from "../pages/Dashboard";
import useAuthStore from "../stores/authStore";
import { useSearchParams } from "react-router-dom";

export default function Home() {
  const [authMode, setAuthMode] = useState(null); // 'login' | 'register' | null
  const [activeView, setActiveView] = useState("home"); // 'home' | 'dashboard'
  const { isAuthenticated } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();

  function handleShowDashboard() {
    if (isAuthenticated) {
      setActiveView("dashboard");
    } else {
      // open login modal
      setAuthMode("login");
    }
  }

  // Open modal based on ?auth=login|register in URL
  useEffect(() => {
    const q = searchParams.get("auth");
    if (q === "login" || q === "register") {
      setAuthMode(q);
    }
    // if param absent, do nothing
  }, [searchParams]);

  // Keep URL in sync with authMode state
  useEffect(() => {
    const q = searchParams.get("auth");
    if (authMode) {
      if (q !== authMode) {
        setSearchParams({ auth: authMode }, { replace: true });
      }
    } else {
      if (q) {
        // remove auth param
        const next = new URLSearchParams(searchParams.toString());
        next.delete("auth");
        setSearchParams(next, { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authMode]);

  return (
    <div className="min-h-screen relative">
      {/* fixed background that covers the viewport only and does not scroll with content */}
      <div className="fixed inset-0 bg-[url('/banner.webp')] bg-cover bg-center bg-fixed"></div>
      {/* overlay over the background */}
      <div className="fixed inset-0 bg-black/55 pointer-events-none"></div>

      <Navbar
        authMode={authMode}
        setAuthMode={setAuthMode}
        onShowDashboard={handleShowDashboard}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        {activeView === "home" ? (
          <>
            {/* Top rounded info box */}
            <div className="mx-auto max-w-3xl rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm p-6 text-white mb-12">
              <div className="text-right text-xs uppercase tracking-wider">
                Hệ thống cơ sở
              </div>
              <ul className="mt-4 text-lg">
                <li>Khu vực: Cầu Giấy</li>
                <li>Khu vực: Ba Đình</li>
                <li>Khu vực: Tây Hồ</li>
              </ul>
            </div>

            {/* Hero center card */}
            <div className="text-center text-white mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Khu vực Kim Mã</h2>
              <p className="text-sm text-white/80">[Ba Đình]</p>
            </div>

            {/* Rooms carousel */}
            <div className="mx-auto max-w-5xl">
              <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                <RoomCard title="Matcha" numbers="301 - 401" />
                <RoomCard title="Andrea" numbers="201" />
                <RoomCard title="Coldzy" numbers="402 - 502 - 602" />
              </div>
              {/* custom scrollbar indicator */}
              <div className="mt-4 h-3 bg-white/20 rounded-full w-full relative">
                <div className="absolute left-0 top-0 h-3 w-1/4 bg-white rounded-full"></div>
              </div>
            </div>

            {/* Hero center card */}
            <div className="text-center text-white mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">
                Khu vực Nghi Tàm
              </h2>
              <p className="text-sm text-white/80">[Tây Hồ]</p>
            </div>

            {/* Rooms carousel */}
            <div className="mx-auto max-w-5xl">
              <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                <RoomCard title="Matcha" numbers="301 - 401" />
                <RoomCard title="Andrea" numbers="201" />
                <RoomCard title="Coldzy" numbers="402 - 502 - 602" />
              </div>
              {/* custom scrollbar indicator */}
              <div className="mt-4 h-3 bg-white/20 rounded-full w-full relative">
                <div className="absolute left-0 top-0 h-3 w-1/4 bg-white rounded-full"></div>
              </div>
            </div>

            {/* Hero center card */}
            <div className="text-center text-white mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">
                Khu vực Dương Quảng Hàm
              </h2>
              <p className="text-sm text-white/80">[Cầu Giấy]</p>
            </div>

            {/* Rooms carousel */}
            <div className="mx-auto max-w-5xl">
              <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                <RoomCard title="Matcha" numbers="301 - 401" />
                <RoomCard title="Andrea" numbers="201" />
                <RoomCard title="Coldzy" numbers="402 - 502 - 602" />
              </div>
              {/* custom scrollbar indicator */}
              <div className="mt-4 h-3 bg-white/20 rounded-full w-full relative">
                <div className="absolute left-0 top-0 h-3 w-1/4 bg-white rounded-full"></div>
              </div>
            </div>

            {/* Contact / CTA area */}
            <div className="mt-16 text-center">
              <div className="inline-block bg-white/90 rounded-xl p-6 shadow-md text-brand-text">
                <h3 className="text-2xl font-semibold">
                  Book Zalo: 0568.668.558 (0947.336.558)
                </h3>
                <p className="mt-2 text-sm">
                  EZ Home - Chuỗi phòng trọ đa sắc màu dành cho giới trẻ
                </p>

                <div className="mt-6 space-y-4">
                  <button className="w-72 md:w-96 bg-teal-700 text-white rounded-lg py-3 flex items-center justify-center gap-3">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      className="fill-white"
                    >
                      <path d="M22 12a10 10 0 10-11.5 9.9V14H8v-2.7h2.5V9.3c0-2.5 1.5-3.9 3.7-3.9 1.1 0 2.3.2 2.3.2v2.5h-1.3c-1.3 0-1.7.8-1.7 1.6v1.8H20l-.5 2.7h-2.8v7.9A10 10 0 0022 12z" />
                    </svg>
                    Đặt qua Facebook
                  </button>

                  <button className="w-72 md:w-96 bg-teal-700 text-white rounded-lg py-3 flex items-center justify-center gap-3">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      className="fill-white"
                    >
                      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" />
                    </svg>
                    Đặt qua Zalo
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-8">
            <Dashboard />
          </div>
        )}
      </div>

      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* subtle gradient to match hero look */}
        <div className="h-full bg-gradient-to-b from-transparent via-black/10 to-black/30"></div>
      </div>
    </div>
  );
}
