"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart3, BookOpen, Heart, LogIn, LogOut, Search, Shield, Upload } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

const publicLinks = [
  { href: "/search", label: "ค้นหาผลงาน", icon: Search },
  { href: "/stats", label: "สถิติ", icon: BarChart3 },
];

export function SiteHeader() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="page-container flex min-h-16 flex-wrap items-center justify-between gap-3 py-2">
        <Link href="/" className="flex items-center gap-3" aria-label="กลับหน้าแรก">
          <span className="grid size-10 place-items-center rounded-xl bg-[#7a0c22] text-white shadow-sm">
            <BookOpen size={21} />
          </span>
          <span>
            <strong className="block text-sm leading-tight text-[#5b0718]">RETC Repository</strong>
            <span className="block text-xs text-slate-500">คลังผลงานวิจัย</span>
          </span>
        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-1 text-sm" aria-label="เมนูหลัก">
          {publicLinks.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="nav-link">
              <Icon size={16} /> {label}
            </Link>
          ))}
          {!loading && user && (
            <>
              <Link href="/my-projects" className="nav-link">ผลงานของฉัน</Link>
              <Link href="/favorites" className="nav-link"><Heart size={16} /> รายการโปรด</Link>
              {(user.user_type === "student" || user.is_staff) && (
                <Link href="/upload" className="nav-link"><Upload size={16} /> อัปโหลด</Link>
              )}
              {user.is_staff && (
                <Link href="/admin" className="nav-link"><Shield size={16} /> Admin</Link>
              )}
              <button type="button" onClick={handleLogout} className="nav-link">
                <LogOut size={16} /> ออกจากระบบ
              </button>
            </>
          )}
          {!loading && !user && (
            <Link href="/login" className="button button-primary ml-1 py-2">
              <LogIn size={16} /> เข้าสู่ระบบ
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
