import Link from "next/link";
import { ArrowRight, BookOpen, Download, Eye, Search, ShieldCheck } from "lucide-react";
import { ProjectCard } from "@/components/project-card";
import { publicApiFetch } from "@/lib/api";
import type { Paginated, Project, Stats } from "@/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [projects, stats] = await Promise.all([
    publicApiFetch<Paginated<Project>>("/projects/?ordering=-id&page_size=6"),
    publicApiFetch<Stats>("/stats/"),
  ]);

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-[#3d0712] via-[#7a0c22] to-[#951936] py-20 text-white sm:py-28">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,white_0,transparent_22%),radial-gradient(circle_at_80%_70%,#f0c060_0,transparent_24%)]" />
        <div className="page-container relative text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
            <ShieldCheck size={17} /> ผลงานที่ผ่านการตรวจสอบและอนุมัติ
          </span>
          <h1 className="mx-auto max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            คลังผลงานวิจัยและนวัตกรรม
            <span className="mt-2 block text-[#f0c060]">วิทยาลัยเทคนิคร้อยเอ็ด</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-red-50 sm:text-lg">
            ค้นหา อ่าน และต่อยอดองค์ความรู้จากผลงานของนักศึกษา ครบทุกสาขาวิชาในที่เดียว
          </p>
          <form action="/search" className="mx-auto mt-9 flex max-w-2xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-2xl sm:flex-row">
            <label htmlFor="home-search" className="sr-only">ค้นหาชื่อผลงานหรือผู้วิจัย</label>
            <div className="flex flex-1 items-center gap-3 px-3">
              <Search className="text-slate-400" size={20} />
              <input id="home-search" name="q" placeholder="ค้นหาชื่อผลงาน ผู้วิจัย หรือคำสำคัญ" className="w-full py-3 text-slate-900 outline-none" />
            </div>
            <button className="button button-gold" type="submit">ค้นหาผลงาน</button>
          </form>
        </div>
      </section>

      <section className="page-container -mt-8 relative z-10 grid gap-4 sm:grid-cols-3">
        {[
          { label: "ผลงานที่เผยแพร่", value: stats?.total_projects ?? 0, icon: BookOpen },
          { label: "ยอดเข้าชมทั้งหมด", value: stats?.total_views ?? 0, icon: Eye },
          { label: "ยอดดาวน์โหลด", value: stats?.total_downloads ?? 0, icon: Download },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="panel flex items-center gap-4">
            <span className="grid size-12 place-items-center rounded-xl bg-red-50 text-[#7a0c22]"><Icon /></span>
            <div><strong className="block text-2xl font-black text-slate-900">{value.toLocaleString("th-TH")}</strong><span className="text-sm text-slate-500">{label}</span></div>
          </div>
        ))}
      </section>

      <section className="page-container py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div><p className="mb-2 text-sm font-bold uppercase tracking-widest text-[#7a0c22]">ผลงานล่าสุด</p><h2 className="section-title">สำรวจงานวิจัยใหม่ในระบบ</h2></div>
          <Link href="/search" className="button button-secondary">ดูทั้งหมด <ArrowRight size={17} /></Link>
        </div>
        {projects?.results.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {projects.results.slice(0, 6).map((project) => <ProjectCard key={project.id} project={project} />)}
          </div>
        ) : (
          <div className="panel py-14 text-center">
            <BookOpen className="mx-auto mb-4 text-slate-300" size={44} />
            <h3 className="text-lg font-bold">ยังไม่มีผลงานที่เผยแพร่</h3>
            <p className="mt-2 text-sm text-slate-500">เมื่อ Backend เปิดทำงานและมีผลงานที่อนุมัติแล้ว รายการจะแสดงตรงนี้</p>
          </div>
        )}
      </section>
    </>
  );
}
