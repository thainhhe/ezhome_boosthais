import React from "react";
import RoomCard from "./RoomCard";

export default function Home() {
  return (
    <div className="min-h-screen relative bg-[url('/hero-bg.jpg')] bg-cover bg-center">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/55"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        {/* Top rounded info box */}
        <div className="mx-auto max-w-3xl rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm p-6 text-white mb-12">
          <div className="text-right text-xs uppercase tracking-wider">
            Hệ thống cơ sở
          </div>
          <ul className="mt-4 text-lg">
            <li>Cơ sở 1: Cầu Giấy</li>
            <li>Cơ sở 2: Ba Đình</li>
            <li>Cơ sở 3: Tây Hồ</li>
          </ul>
        </div>

        {/* Hero center card */}
        <div className="text-center text-white mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            Cơ sở Dương Quảng Hàm
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
              Lala House - Chuỗi Homestay đa sắc màu dành cho giới trẻ
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
      </div>

      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* subtle gradient to match hero look */}
        <div className="h-full bg-gradient-to-b from-transparent via-black/10 to-black/30"></div>
      </div>
    </div>
  );
}
