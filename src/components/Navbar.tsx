"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  // Don't show navbar on sub contractor pages — keep it distraction-free
  if (pathname.startsWith("/sub/")) return null;

  return (
    <nav className="w-full border-b border-[#d3cec7] bg-[#f7f3ef]">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-[#f26522] text-xl font-bold tracking-tight">
            Crew<span className="text-[#1a1614]">base</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-2">
          <Link
            href="/today"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/today"
                ? "bg-[#e4dfd9] text-[#1a1614]"
                : "text-[#7a7470] hover:text-[#1a1614] hover:bg-[#e7e3de]"
            }`}
          >
            Today
          </Link>

          <Link
            href="/jobs"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/jobs"
                ? "bg-[#e4dfd9] text-[#1a1614]"
                : "text-[#7a7470] hover:text-[#1a1614] hover:bg-[#e7e3de]"
            }`}
          >
            Jobs
          </Link>

          <Link
            href="/admin"
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              pathname === "/admin"
                ? "bg-[#f26522] border-[#f26522] text-[#f7f3ef]"
                : "border-[#d3cec7] text-[#7a7470] hover:border-[#f26522] hover:text-[#f26522]"
            }`}
          >
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
