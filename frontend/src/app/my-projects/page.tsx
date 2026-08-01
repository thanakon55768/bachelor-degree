import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PrivateProjectList } from "@/components/private-project-list";

export const metadata: Metadata = { title: "ผลงานของฉัน" };

export default function MyProjectsPage() {
  return <div className="page-container py-10 sm:py-14"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold text-[#7a0c22]">พื้นที่ส่วนตัว</p><h1 className="section-title mt-2">ผลงานของฉัน</h1><p className="mt-2 text-slate-500">ดูสถานะ แก้ไข หรือลบผลงานที่คุณส่งเข้าระบบ</p></div><Link href="/upload" className="button button-primary"><Plus size={17} /> เพิ่มผลงาน</Link></div><PrivateProjectList mode="mine" /></div>;
}
