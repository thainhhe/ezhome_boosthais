import React, { useState, useEffect } from "react";
import RoomCard from "./RoomCard";
import Navbar from "./Navbar";
import Dashboard from "../pages/Dashboard";
import useAuthStore from "../stores/authStore";
import { useSearchParams, Link } from "react-router-dom";
import { homeService } from "../services/homeService";
import useDragScroll from "../hooks/useDragScroll";

const HorizontalScroll = ({ children, className = "" }) => {
  const containerRef = useDragScroll();
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const indicatorRef = React.useRef(null);
  const [thumbWidth, setThumbWidth] = useState(25); // percent
  const [thumbLeft, setThumbLeft] = useState(0); // percent
  const draggingRef = React.useRef({
    dragging: false,
    startX: 0,
    startLeft: 0,
  });

  const updateArrows = () => {
    const el = containerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    // add a small epsilon to avoid off-by-one issues
    setCanScrollRight(el.scrollWidth > el.clientWidth + el.scrollLeft + 1);

    // update thumb size & position
    const wrapper = indicatorRef.current;
    if (!wrapper) return;
    const visibleRatio = el.clientWidth / Math.max(el.scrollWidth, 1);
    const minPercent = 6;
    const widthPercent = Math.max(visibleRatio * 100, minPercent);
    setThumbWidth(widthPercent);

    const maxScroll = Math.max(el.scrollWidth - el.clientWidth, 1);
    const leftPercent = (el.scrollLeft / maxScroll) * (100 - widthPercent);
    setThumbLeft(Number.isFinite(leftPercent) ? leftPercent : 0);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    // initialize
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef]);

  // pointer handlers for dragging the thumb
  useEffect(() => {
    const onPointerMove = (e) => {
      const info = draggingRef.current;
      if (!info.dragging) return;
      const wrapper = indicatorRef.current;
      const el = containerRef.current;
      if (!wrapper || !el) return;
      const rect = wrapper.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
      const localX = clamp(px, 0, rect.width);
      const pct = (localX / rect.width) * 100; // pct where pointer is
      const newLeft = clamp(pct - info.startOffsetPercent, 0, 100 - thumbWidth);
      setThumbLeft(newLeft);

      // set scrollLeft accordingly
      const scrollable = Math.max(el.scrollWidth - el.clientWidth, 1);
      const scrollLeft = (newLeft / (100 - thumbWidth)) * scrollable;
      el.scrollTo({ left: scrollLeft, behavior: "auto" });
    };

    const onPointerUp = () => {
      draggingRef.current.dragging = false;
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thumbWidth]);

  const onThumbPointerDown = (e) => {
    const wrapper = indicatorRef.current;
    const el = containerRef.current;
    if (!wrapper || !el) return;
    const rect = wrapper.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const offsetPercent = (px / rect.width) * 100 - thumbLeft;
    draggingRef.current = {
      dragging: true,
      startX: e.clientX,
      startOffsetPercent: offsetPercent,
    };

    const onPointerMove = (ev) => {
      const info = draggingRef.current;
      if (!info.dragging) return;
      const rect2 = wrapper.getBoundingClientRect();
      const localX = Math.max(
        0,
        Math.min(rect2.width, ev.clientX - rect2.left)
      );
      const pct = (localX / rect2.width) * 100;
      const newLeft = Math.max(
        0,
        Math.min(100 - thumbWidth, pct - info.startOffsetPercent)
      );
      setThumbLeft(newLeft);
      const scrollable = Math.max(el.scrollWidth - el.clientWidth, 1);
      const scrollLeft = (newLeft / (100 - thumbWidth)) * scrollable;
      el.scrollTo({ left: scrollLeft, behavior: "auto" });
    };

    const onPointerUp = () => {
      draggingRef.current.dragging = false;
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    // prevent default to avoid text selection
    e.preventDefault();
  };

  const scrollAmount = () => {
    const el = containerRef.current;
    return Math.floor((el?.clientWidth || 300) * 0.7);
  };

  const scrollLeft = () => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollBy({ left: -scrollAmount(), behavior: "smooth" });
  };

  const scrollRight = () => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollBy({ left: scrollAmount(), behavior: "smooth" });
  };

  return (
    <div className={`relative ${className}`}>
      {/* left arrow */}
      <button
        type="button"
        aria-label="Scroll left"
        onClick={scrollLeft}
        className={`hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 items-center justify-center h-10 w-10 rounded-full bg-white/90 shadow-md hover:bg-white transition-colors ${
          canScrollLeft ? "opacity-100" : "opacity-40 pointer-events-none"
        }`}
      >
        <svg
          className="w-5 h-5 text-gray-800"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 18l-6-6 6-6"
          />
        </svg>
      </button>

      {/* container */}
      <div
        ref={containerRef}
        className={`flex flex-nowrap gap-6 overflow-x-auto pb-4 scrollbar-hide cursor-grab active:cursor-grabbing`}
      >
        {children}
      </div>

      {/* scrollbar indicator */}
      <div
        ref={indicatorRef}
        className="mt-4 h-3 bg-white/20 rounded-full w-full relative"
      >
        <div
          role="slider"
          aria-label="carousel position"
          onPointerDown={onThumbPointerDown}
          style={{ left: `${thumbLeft}%`, width: `${thumbWidth}%` }}
          className="absolute top-0 h-3 bg-white rounded-full shadow-sm touch-none"
        />
      </div>

      {/* right arrow */}
      <button
        type="button"
        aria-label="Scroll right"
        onClick={scrollRight}
        className={`hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 items-center justify-center h-10 w-10 rounded-full bg-white/90 shadow-md hover:bg-white transition-colors ${
          canScrollRight ? "opacity-100" : "opacity-40 pointer-events-none"
        }`}
      >
        <svg
          className="w-5 h-5 text-gray-800"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 6l6 6-6 6"
          />
        </svg>
      </button>

      {/* mobile floating arrows (small, visible on small screens) */}
      <div className="md:hidden absolute left-2 bottom-2 z-20 flex gap-2">
        <button
          type="button"
          aria-label="Scroll left"
          onClick={scrollLeft}
          className={`flex items-center justify-center h-8 w-8 rounded-full bg-white/90 shadow-md hover:bg-white transition-colors ${
            canScrollLeft ? "opacity-100" : "opacity-40 pointer-events-none"
          }`}
        >
          <svg
            className="w-4 h-4 text-gray-800"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 18l-6-6 6-6"
            />
          </svg>
        </button>

        <button
          type="button"
          aria-label="Scroll right"
          onClick={scrollRight}
          className={`flex items-center justify-center h-8 w-8 rounded-full bg-white/90 shadow-md hover:bg-white transition-colors ${
            canScrollRight ? "opacity-100" : "opacity-40 pointer-events-none"
          }`}
        >
          <svg
            className="w-4 h-4 text-gray-800"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 6l6 6-6 6"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default function Home() {
  const [authMode, setAuthMode] = useState(null); // 'login' | 'register' | null
  const [activeView, setActiveView] = useState("home"); // 'home' | 'dashboard'
  const { isAuthenticated } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [topDistricts, setTopDistricts] = useState([]);
  const [topDistrictsLoading, setTopDistrictsLoading] = useState(false);
  const [topDistrictsError, setTopDistrictsError] = useState(null);

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

  // Fetch top districts
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setTopDistrictsLoading(true);
      setTopDistrictsError(null);
      try {
        const data = await homeService.getTopDistricts();
        const list = Array.isArray(data?.districts) ? data.districts : [];
        if (mounted) setTopDistricts(list);
      } catch (err) {
        console.error("Failed to load top districts", err);
        if (mounted) setTopDistrictsError(err);
      } finally {
        if (mounted) setTopDistrictsLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

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
            {/* Top rounded info box - Lala House Card */}
            <div className="mx-auto max-w-4xl rounded-3xl bg-white shadow-2xl mb-12 overflow-hidden">
              <div className="relative">
                {/* Subscribe button */}
                <button className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  <span className="font-medium text-gray-800">Subscribe</span>
                </button>

                {/* Share button */}
                <button className="absolute top-6 right-6 z-20 p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow">
                  <svg
                    className="w-5 h-5 text-gray-800"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                </button>

                <div className="flex flex-col md:flex-row">
                  {/* Left side - Room image */}
                  <div className="md:w-2/5 relative">
                    <img
                      src="/banner.webp"
                      alt="Lala House Room"
                      className="w-full h-64 md:h-full object-cover"
                    />
                  </div>

                  {/* Right side - Content */}
                  <div className="md:w-3/5 p-8 md:p-12 flex flex-col justify-between">
                    <div>
                      {/* Header text */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-teal-600 font-medium text-lg">
                          Lala House
                        </span>
                        <span className="text-gray-400 font-light italic text-lg">
                          #Homestay
                        </span>
                      </div>

                      {/* Main title */}
                      <h2 className="text-4xl md:text-5xl font-bold text-teal-600 leading-tight mb-4">
                        CHỖ GIỚI TRẺ
                        <br />
                        HÀ NỘI
                      </h2>

                      {/* Description */}
                      <p className="text-gray-600 text-base leading-relaxed mb-6">
                        Với hệ thống homestay đa dạng,
                        <br />
                        trendy, chuẩn gu cao cấp đời
                      </p>

                      {/* Heart icon */}
                      <div className="flex justify-end mb-6">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Logo at bottom */}
                    <div className="flex justify-center mt-8">
                      <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg p-3">
                        <img 
                          src="/logo.png" 
                          alt="EZ Home Logo" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hệ thống cơ sở - Original box */}
            <div className="mx-auto max-w-3xl rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm p-6 text-white mb-12">
              <div className="text-right text-xs uppercase tracking-wider">
                Hệ thống cơ sở
              </div>
              {/* dynamic top-3 districts by roomCount from API */}
              <div className="mt-4 text-lg text-white">
                {topDistrictsLoading ? (
                  <div>Đang tải khu vực...</div>
                ) : topDistrictsError ? (
                  <div className="text-amber-200">Không thể tải khu vực</div>
                ) : Array.isArray(topDistricts) && topDistricts.length ? (
                  <ul className="space-y-2">
                    {[...topDistricts]
                      .sort((a, b) => (b.roomCount || 0) - (a.roomCount || 0))
                      .slice(0, 3)
                      .map((d) => (
                        <li key={d.district}>
                          Khu vực: {d.district}{" "}
                          <span className="text-sm text-white/80">
                            • {d.roomCount || 0} phòng
                          </span>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <div>Chưa có dữ liệu khu vực</div>
                )}
              </div>
              <div className="mt-4">
                <Link
                  to="/rooms"
                  className="inline-block px-4 py-2 bg-amber-600 text-white rounded"
                >
                  Xem thêm tất cả phòng
                </Link>
              </div>
            </div>

            {/* Top districts (dynamic) */}
            {topDistrictsLoading ? (
              <div className="text-white text-center mb-12">
                Đang tải khu vực nổi bật...
              </div>
            ) : topDistrictsError ? (
              <div className="text-amber-200 text-center mb-12">
                Không thể tải khu vực nổi bật
              </div>
            ) : topDistricts.length ? (
              topDistricts.map((district) => {
                const roomsInDistrict = Array.isArray(district.rooms)
                  ? district.rooms.map((room, __idx) => {
                      // Debug: log room IDs and index if invalid or duplicate-like ids
                      if (!room._id || room._id === "1") {
                        console.warn(
                          "Invalid or suspicious room ID in district (index):",
                          district.district,
                          __idx,
                          room
                        );
                      }
                      return {
                        ...room,
                        __idx,
                        address: {
                          city: "Thành phố Hà Nội",
                          district: district.district,
                        },
                      };
                    })
                  : [];

                return (
                  <div key={district.district} className="mb-16">
                    {/* District title */}
                    <div className="text-center text-white mb-12">
                      <h2 className="text-3xl md:text-4xl font-bold">
                        Khu vực {district.district}
                      </h2>
                      <p className="text-sm text-white/80">
                        [{district.roomCount} phòng]
                      </p>
                    </div>

                    {/* Rooms carousel */}
                    <div className="mx-auto max-w-5xl">
                      {roomsInDistrict.length ? (
                        <HorizontalScroll>
                          {roomsInDistrict.map((room) => (
                            <RoomCard
                              key={`${room._id || room.id || room.__idx}-${
                                district.district
                              }`}
                              room={room}
                              className="shrink-0"
                            />
                          ))}
                        </HorizontalScroll>
                      ) : (
                        <div className="text-white text-center">
                          Chưa có phòng mẫu trong khu vực này
                        </div>
                      )}

                      {/* indicator is rendered inside HorizontalScroll */}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-white text-center">
                Chưa có dữ liệu khu vực nổi bật
              </div>
            )}

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
