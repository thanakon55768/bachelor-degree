import type { Metadata } from "next";
import { Search as SearchIcon } from "lucide-react";
import { ProjectCard } from "@/components/project-card";
import { publicApiFetch } from "@/lib/api";
import type { Paginated, Project, ProjectOptions } from "@/types";

export const metadata: Metadata = { title: "ค้นหาผลงาน" };
export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    q?: string;
    department?: string;
    program?: string;
    academic_year?: string;
    page?: string;
  }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.department) query.set("department", params.department);
  if (params.program) query.set("program", params.program);
  if (params.academic_year) query.set("academic_year", params.academic_year);
  if (params.page) query.set("page", params.page);

  const [projects, options] = await Promise.all([
    publicApiFetch<Paginated<Project>>(`/projects/?${query.toString()}`),
    publicApiFetch<ProjectOptions>("/projects/options/"),
  ]);
  const availablePrograms = params.department
    ? options?.programs.filter((item) => item.department === params.department)
    : options?.programs;

  return (
    <div className="page-container py-10 sm:py-14">
      <div className="mb-8">
        <p className="text-sm font-bold text-[#7a0c22]">ระบบสืบค้นผลงาน</p>
        <h1 className="section-title mt-2">ค้นหางานวิจัยที่ต้องการ</h1>
        <p className="mt-2 text-slate-500">ค้นจากชื่อเรื่อง ชื่อผู้วิจัย คำสำคัญ แผนก สาขา หรือปีการศึกษา</p>
      </div>

      <form className="panel mb-8 grid gap-4 lg:grid-cols-[2fr_1fr_1.2fr_0.8fr_auto]" action="/search">
        <div>
          <label htmlFor="q" className="field-label">คำค้นหา</label>
          <input id="q" name="q" defaultValue={params.q} className="field" placeholder="เช่น IoT, หุ่นยนต์, นายสมชาย" />
        </div>
        <div>
          <label htmlFor="department" className="field-label">แผนกวิชา</label>
          <select id="department" name="department" defaultValue={params.department} className="field">
            <option value="">ทุกแผนก</option>
            {options?.departments.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="program" className="field-label">สาขาวิชา</label>
          <select id="program" name="program" defaultValue={params.program} className="field">
            <option value="">ทุกสาขา</option>
            {availablePrograms?.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="academic_year" className="field-label">ปีการศึกษา</label>
          <input
            id="academic_year"
            name="academic_year"
            type="number"
            min={options?.academic_year_min}
            max={options?.academic_year_max}
            list="academic-year-options"
            defaultValue={params.academic_year}
            className="field"
            placeholder="ทุกปี"
          />
          <datalist id="academic-year-options">
            {options?.academic_years.map((year) => <option key={year} value={year} />)}
          </datalist>
        </div>
        <button type="submit" className="button button-primary self-end"><SearchIcon size={17} /> ค้นหา</button>
      </form>

      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-bold text-slate-800">พบ {projects?.count ?? 0} ผลงาน</h2>
      </div>
      {projects?.results.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.results.map((project) => <ProjectCard key={project.id} project={project} />)}
        </div>
      ) : (
        <div className="panel py-16 text-center text-slate-500">ไม่พบผลงานที่ตรงกับคำค้นหา ลองเปลี่ยนคำหรือเอาตัวกรองออก</div>
      )}
    </div>
  );
}
