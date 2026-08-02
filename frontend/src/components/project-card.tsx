import Link from "next/link";
import { ArrowRight, Download, Eye, Star } from "lucide-react";
import type { Project } from "@/types";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#c9972b]/60 hover:shadow-lg">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="badge">{project.department_name}</span>
        <span className="text-sm font-semibold text-slate-500">พ.ศ. {project.academic_year}</span>
      </div>
      {project.program_name ? <p className="mb-3 text-xs font-semibold text-[#7a0c22]">{project.program_name}</p> : null}
      <Link href={`/projects/${project.id}`} className="text-lg font-bold leading-7 text-slate-900 transition group-hover:text-[#7a0c22]">
        {project.title_th}
      </Link>
      {project.title_en && <p className="mt-1 line-clamp-1 text-sm text-slate-500">{project.title_en}</p>}
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{project.abstract}</p>
      <div className="mt-4 text-sm text-slate-500">ผู้วิจัย: <span className="font-medium text-slate-700">{project.student_name}</span></div>
      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
        <span className="flex items-center gap-1"><Eye size={14} /> {project.views_count.toLocaleString("th-TH")}</span>
        <span className="flex items-center gap-1"><Download size={14} /> {project.download_count.toLocaleString("th-TH")}</span>
        <span className="flex items-center gap-1"><Star size={14} className="fill-amber-400 text-amber-400" /> {project.average_rating || "–"}</span>
        <Link href={`/projects/${project.id}`} className="flex items-center gap-1 font-bold text-[#7a0c22]">
          อ่านต่อ <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}
