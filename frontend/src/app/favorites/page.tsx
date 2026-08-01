import type { Metadata } from "next";
import { PrivateProjectList } from "@/components/private-project-list";

export const metadata: Metadata = { title: "รายการโปรด" };

export default function FavoritesPage() {
  return <div className="page-container py-10 sm:py-14"><p className="text-sm font-bold text-[#7a0c22]">ผลงานที่บันทึกไว้</p><h1 className="section-title mt-2">รายการโปรดของฉัน</h1><p className="mb-8 mt-2 text-slate-500">กลับมาอ่านหรือดาวน์โหลดผลงานที่สนใจได้สะดวก</p><PrivateProjectList mode="favorites" /></div>;
}
