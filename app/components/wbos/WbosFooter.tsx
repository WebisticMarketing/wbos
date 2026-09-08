// components/wbos/WbosFooter.tsx
"use client";

import Link from "next/link";

export default function WbosFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-sm text-gray-500">
            &copy; {year} All rights reserved
          </p>
          <p className="text-sm text-gray-400">
            Powered by{" "}
            <Link
              href="https://webistic.co"
              target="_blank"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Webistic
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}