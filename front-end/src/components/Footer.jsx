import React from "react";

export default function Footer() {
  return (
    <footer className="mt-8 bg-green-50 border-t py-6">
      <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-600">
        <div className="mb-2">
          © {new Date().getFullYear()} EZHome — All rights reserved.
        </div>
        <div className="flex items-center justify-center gap-4">
          <a className="hover:underline" href="/terms">
            Terms
          </a>
          <span className="text-gray-300">|</span>
          <a className="hover:underline" href="/privacy">
            Privacy
          </a>
          <span className="text-gray-300">|</span>
          <a className="hover:underline" href="/contact">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
