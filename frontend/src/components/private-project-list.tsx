"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Edit3, ExternalLink, FileText, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Paginated, Project } from "@/types";

export function PrivateProjectList({ mode }: { mode: "mine" | "favorites" }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiFetch<Paginated<Project>>(`/projects/${mode}/`);
      setProjects(response.results);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "โหลดข้อมูลไม่สำเร็จ");
    } finally { setLoading(false); }
  }, [mode]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [load]);

  async function remove(project: Project) {
    if (!confirm(`ต้องการลบ “${project.title_th}” หรือไม่?`)) return;
    await apiFetch(`/projects/${project.id}/`, { method: "DELETE" });
    await load();
  }

  async function unfavorite(project: Project) {
    await apiFetch(`/projects/${project.id}/favorite/`, { method: "POST" });
    await load();
  }

  if (loading) return <div className="panel text-center text-slate-500">กำลังโหลด...</div>;
  if (error) return <div className="panel text-center text-red-700">{error} — กรุณาเข้าสู่ระบบ</div>;
  if (!projects.length) return <div className="panel py-16 text-center"><FileText className="mx-auto text-slate-300" size={42} /><p className="mt-4 text-slate-500">{mode === "mine" ? "คุณยังไม่มีผลงานในระบบ" : "ยังไม่มีรายการโปรด"}</p></div>;

  return <div className="space-y-4">{projects.map((project) => <article key={project.id} className="panel flex flex-col gap-4 sm:flex-row sm:items-center"><div className="flex-1"><div className="mb-2 flex flex-wrap gap-2"><span className="badge">{project.department_name}</span>{mode === "mine" && <span className={`rounded-full px-3 py-1 text-xs font-bold ${project.is_approved ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{project.is_approved ? "เผยแพร่แล้ว" : "รอตรวจสอบ"}</span>}</div><h2 className="font-bold text-slate-900">{project.title_th}</h2><p className="mt-1 text-sm text-slate-500">พ.ศ. {project.academic_year} · {project.student_name}</p></div><div className="flex flex-wrap gap-2"><Link href={`/projects/${project.id}`} className="button button-secondary py-2"><ExternalLink size={15} /> ดู</Link>{mode === "mine" ? <><Link href={`/projects/${project.id}/edit`} className="button button-secondary py-2"><Edit3 size={15} /> แก้ไข</Link><button type="button" onClick={() => remove(project)} className="button border border-red-200 bg-white py-2 text-red-700 hover:bg-red-50"><Trash2 size={15} /> ลบ</button></> : <button type="button" onClick={() => unfavorite(project)} className="button border border-red-200 bg-white py-2 text-red-700 hover:bg-red-50">นำออก</button>}</div></article>)}</div>;
}
