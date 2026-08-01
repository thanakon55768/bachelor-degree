import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Download, Eye, Star } from "lucide-react";
import { publicApiFetch } from "@/lib/api";
import type { Stats } from "@/types";

export const metadata: Metadata = { title: "สถิติภาพรวม" };
export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const stats = await publicApiFetch<Stats>("/stats/");
  const maxDepartment = Math.max(...(stats?.department_counts.map((item) => item.count) ?? [1]));

  return (
    <div className="page-container py-10 sm:py-14">
      <div className="mb-8"><p className="text-sm font-bold text-[#7a0c22]">ข้อมูลจากผลงานที่อนุมัติแล้ว</p><h1 className="section-title mt-2">สถิติภาพรวมของระบบ</h1></div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "ผลงานทั้งหมด", value: stats?.total_projects ?? 0, icon: BookOpen },
          { label: "ยอดเข้าชม", value: stats?.total_views ?? 0, icon: Eye },
          { label: "ยอดดาวน์โหลด", value: stats?.total_downloads ?? 0, icon: Download },
        ].map(({ label, value, icon: Icon }) => <div key={label} className="panel flex items-center gap-4"><span className="grid size-12 place-items-center rounded-xl bg-red-50 text-[#7a0c22]"><Icon /></span><div><strong className="block text-3xl font-black">{value.toLocaleString("th-TH")}</strong><span className="text-sm text-slate-500">{label}</span></div></div>)}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="panel">
          <h2 className="mb-6 text-lg font-bold">จำนวนผลงานแยกตามสาขา</h2>
          <div className="space-y-5">
            {stats?.department_counts.map((item) => <div key={item.department}><div className="mb-2 flex justify-between gap-3 text-sm"><span>{item.department_name}</span><strong>{item.count}</strong></div><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-[#7a0c22] to-[#c9972b]" style={{ width: `${Math.max(6, (item.count / maxDepartment) * 100)}%` }} /></div></div>)}
            {!stats?.department_counts.length && <p className="text-sm text-slate-500">ยังไม่มีข้อมูล</p>}
          </div>
        </section>

        <section className="panel">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-bold"><Star className="fill-amber-400 text-amber-400" size={20} /> ผลงานคะแนนสูงสุด</h2>
          <div className="divide-y divide-slate-100">
            {stats?.top_rated.map((project, index) => <Link key={project.id} href={`/projects/${project.id}`} className="flex gap-4 py-4 hover:text-[#7a0c22]"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-red-50 text-sm font-black text-[#7a0c22]">{index + 1}</span><span className="flex-1 font-medium">{project.title_th}</span><strong>{project.average_rating.toFixed(1)}</strong></Link>)}
            {!stats?.top_rated.length && <p className="py-6 text-sm text-slate-500">ยังไม่มีการให้คะแนน</p>}
          </div>
        </section>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="panel"><h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><Eye className="text-[#7a0c22]" /> ยอดเข้าชมสูงสุด 5 อันดับ</h2><div className="divide-y divide-slate-100">{stats?.top_viewed.map((project, index) => <Link key={project.id} href={`/projects/${project.id}`} className="flex items-center gap-3 py-4 hover:text-[#7a0c22]"><strong className="w-7 text-center text-[#7a0c22]">{index + 1}</strong><span className="flex-1">{project.title_th}</span><span className="text-sm font-bold">{project.views_count.toLocaleString("th-TH")}</span></Link>)}{!stats?.top_viewed.length && <p className="py-6 text-sm text-slate-500">ยังไม่มีข้อมูล</p>}</div></section>
        <section className="panel"><h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><Download className="text-[#7a0c22]" /> ยอดดาวน์โหลดสูงสุด 5 อันดับ</h2><div className="divide-y divide-slate-100">{stats?.top_downloaded.map((project, index) => <Link key={project.id} href={`/projects/${project.id}`} className="flex items-center gap-3 py-4 hover:text-[#7a0c22]"><strong className="w-7 text-center text-[#7a0c22]">{index + 1}</strong><span className="flex-1">{project.title_th}</span><span className="text-sm font-bold">{project.download_count.toLocaleString("th-TH")}</span></Link>)}{!stats?.top_downloaded.length && <p className="py-6 text-sm text-slate-500">ยังไม่มีข้อมูล</p>}</div></section>
      </div>
    </div>
  );
}
