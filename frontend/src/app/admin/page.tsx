import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin-dashboard";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default function AdminPage() {
  return <div className="page-container py-10 sm:py-14"><p className="text-sm font-bold text-[#7a0c22]">สำหรับเจ้าหน้าที่</p><h1 className="section-title mt-2">Admin Dashboard</h1><p className="mb-8 mt-2 text-slate-500">ตรวจสอบผลงาน จัดการสมาชิก และส่งออกข้อมูล</p><AdminDashboard /></div>;
}
