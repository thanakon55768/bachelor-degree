import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { ArrowLeft, Calendar, Download, Eye, Star, UserRound } from "lucide-react";
import { ProjectDetailActions } from "@/components/project-detail-actions";
import { PrivateProjectDetailLoader } from "@/components/private-project-detail-loader";
import { publicApiFetch } from "@/lib/api";
import type { Project } from "@/types";

type Props = { params: Promise<{ id: string }> };
const getProject = cache((id: string) => publicApiFetch<Project>(`/projects/${id}/`));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) return { title: "ไม่พบผลงาน" };
  return { title: project.title_th, description: project.abstract.slice(0, 155) };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) return <PrivateProjectDetailLoader id={id} />;

  const sections = [
    ["ความเป็นมาและความสำคัญ", project.background],
    ["วัตถุประสงค์", project.objectives],
    ["ขอบเขตการวิจัย", project.scope],
    ["ทฤษฎีที่เกี่ยวข้อง", project.theory],
    ["ระเบียบวิธีวิจัย", project.methodology],
    ["ผลการวิจัย", project.results],
    ["อภิปรายผล", project.discussion],
    ["ข้อเสนอแนะในการนำไปใช้", project.suggestions_use],
    ["ข้อเสนอแนะสำหรับการวิจัยครั้งต่อไป", project.suggestions_next],
  ].filter(([, value]) => value);

  return (
    <div className="page-container py-8 sm:py-12">
      <Link href="/search" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-[#7a0c22]"><ArrowLeft size={16} /> กลับไปหน้าค้นหา</Link>
      <article className="panel overflow-hidden p-0 sm:p-0">
        <div className="bg-gradient-to-br from-[#4e0715] to-[#8f1730] p-6 text-white sm:p-10">
          <div className="flex flex-wrap gap-2"><span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">{project.department_name}</span><span className="rounded-full bg-[#c9972b] px-3 py-1 text-xs font-bold">{project.research_type_name}</span>{!project.is_approved && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">รออนุมัติ</span>}</div>
          <h1 className="mt-5 text-2xl font-black leading-tight sm:text-4xl">{project.title_th}</h1>
          {project.title_en && <p className="mt-3 text-red-100">{project.title_en}</p>}
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-red-50"><span className="flex items-center gap-2"><UserRound size={16} /> {project.student_name}</span><span className="flex items-center gap-2"><Calendar size={16} /> พ.ศ. {project.academic_year}</span><span className="flex items-center gap-2"><Eye size={16} /> {project.views_count}</span><span className="flex items-center gap-2"><Download size={16} /> {project.download_count}</span><span className="flex items-center gap-2"><Star size={16} className="fill-[#f0c060] text-[#f0c060]" /> {project.average_rating || "ยังไม่มีคะแนน"}</span></div>
        </div>
        <div className="p-6 sm:p-10">
          <section><h2 className="text-xl font-bold text-[#7a0c22]">บทคัดย่อ</h2><p className="mt-3 whitespace-pre-wrap leading-8 text-slate-700">{project.abstract}</p>{project.keywords && <p className="mt-4 text-sm"><strong>คำสำคัญ:</strong> {project.keywords}</p>}</section>
          {sections.map(([title, content]) => <section key={title} className="mt-8 border-t border-slate-100 pt-7"><h2 className="text-xl font-bold text-[#7a0c22]">{title}</h2><p className="mt-3 whitespace-pre-wrap leading-8 text-slate-700">{content}</p></section>)}
        </div>
      </article>
      <ProjectDetailActions initialProject={project} />
    </div>
  );
}
