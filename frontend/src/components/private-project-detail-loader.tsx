"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProjectDetailActions } from "@/components/project-detail-actions";
import { apiFetch } from "@/lib/api";
import type { Project } from "@/types";

export function PrivateProjectDetailLoader({ id }: { id: string }) {
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<Project>(`/projects/${id}/`)
      .then(setProject)
      .catch((caught) => setError(caught instanceof Error ? caught.message : "ไม่พบผลงาน"));
  }, [id]);

  if (error) return <div className="page-container py-20"><div className="panel text-center text-red-700">{error}</div></div>;
  if (!project) return <div className="page-container py-20"><div className="panel text-center text-slate-500">กำลังตรวจสอบผลงานส่วนตัว...</div></div>;

  return <div className="page-container py-8 sm:py-12"><Link href="/my-projects" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-[#7a0c22]"><ArrowLeft size={16} /> กลับไปผลงานของฉัน</Link><article className="panel"><div className="flex flex-wrap gap-2"><span className="badge">{project.department_name}</span><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">รอตรวจสอบ</span></div><h1 className="mt-5 text-2xl font-black sm:text-4xl">{project.title_th}</h1><p className="mt-3 text-slate-500">{project.student_name} · พ.ศ. {project.academic_year}</p><section className="mt-8 border-t border-slate-100 pt-7"><h2 className="text-xl font-bold text-[#7a0c22]">บทคัดย่อ</h2><p className="mt-3 whitespace-pre-wrap leading-8 text-slate-700">{project.abstract}</p></section></article><ProjectDetailActions initialProject={project} /></div>;
}
