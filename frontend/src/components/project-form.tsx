"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileUp, Save } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Project, ProjectOptions } from "@/types";

const textAreas = [
  ["background", "ความเป็นมา/หลักการและเหตุผล"],
  ["objectives", "วัตถุประสงค์การวิจัย"],
  ["scope", "ขอบเขตการวิจัย"],
  ["abstract", "บทคัดย่อ *"],
  ["theory", "ทฤษฎีที่เกี่ยวข้อง"],
  ["methodology", "ระเบียบวิธีวิจัย"],
  ["results", "ผลการวิจัย"],
  ["discussion", "อภิปรายผล"],
  ["suggestions_use", "ข้อเสนอแนะในการนำไปใช้"],
  ["suggestions_next", "ข้อเสนอแนะสำหรับงานวิจัยครั้งต่อไป"],
  ["awards", "รางวัลที่ได้รับ"],
  ["other_info", "ข้อมูลเพิ่มเติม"],
] as const;

export function ProjectForm({ project }: { project?: Project }) {
  const router = useRouter();
  const [options, setOptions] = useState<ProjectOptions | null>(null);
  const [department, setDepartment] = useState(project?.department ?? "CT");
  const [program, setProgram] = useState(project?.program ?? "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    apiFetch<ProjectOptions>("/projects/options/")
      .then((response) => {
        if (active) setOptions(response);
      })
      .catch((caught) => {
        if (active) {
          setError(caught instanceof Error ? caught.message : "โหลดรายชื่อแผนกไม่สำเร็จ");
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const availablePrograms =
    options?.programs.filter((item) => item.department === department) ?? [];
  const currentBuddhistYear = new Date().getFullYear() + 543;
  const minimumYear = options?.academic_year_min ?? 2481;
  const maximumYear = options?.academic_year_max ?? currentBuddhistYear + 1;

  function changeDepartment(value: string) {
    setDepartment(value);
    const selectedProgramStillMatches = options?.programs.some(
      (item) => item.value === program && item.department === value,
    );
    if (!selectedProgramStillMatches) setProgram("");
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const file = formData.get("pdf_file");
    if (file instanceof File && file.size === 0) formData.delete("pdf_file");
    if (file instanceof File && file.size > 10 * 1024 * 1024) {
      setError("ไฟล์ PDF มีขนาดเกิน 10 MB");
      setSubmitting(false);
      return;
    }

    try {
      const saved = await apiFetch<Project>(project ? `/projects/${project.id}/` : "/projects/", {
        method: project ? "PATCH" : "POST",
        body: formData,
      });
      router.push(`/projects/${saved.id}`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <section className="panel">
        <h2 className="text-lg font-bold text-[#7a0c22]">1. ข้อมูลพื้นฐาน</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="title_th" className="field-label">ชื่อผลงานภาษาไทย *</label>
            <input id="title_th" name="title_th" defaultValue={project?.title_th} className="field" required />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="title_en" className="field-label">ชื่อผลงานภาษาอังกฤษ</label>
            <input id="title_en" name="title_en" defaultValue={project?.title_en ?? ""} className="field" />
          </div>
          <div>
            <label htmlFor="department" className="field-label">แผนกวิชา *</label>
            <select
              id="department"
              name="department"
              value={department}
              onChange={(event) => changeDepartment(event.target.value)}
              className="field"
              required
            >
              {options?.departments.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="program" className="field-label">สาขาวิชา/ระดับการศึกษา *</label>
            <select
              id="program"
              name="program"
              value={program}
              onChange={(event) => setProgram(event.target.value)}
              className="field"
              required
            >
              <option value="">เลือกสาขาวิชา</option>
              {availablePrograms.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">รายการสาขาจะเปลี่ยนตามแผนกที่เลือก</p>
          </div>
          <div>
            <label htmlFor="academic_year" className="field-label">ปีการศึกษา (พ.ศ.) *</label>
            <input
              id="academic_year"
              name="academic_year"
              type="number"
              min={minimumYear}
              max={maximumYear}
              defaultValue={project?.academic_year ?? currentBuddhistYear}
              className="field"
              required
            />
            <p className="mt-1 text-xs text-slate-500">
              กรอกได้ตั้งแต่ พ.ศ. {minimumYear} ถึง {maximumYear} เช่น 2556, 2558 หรือ 2560
            </p>
          </div>
          <div>
            <label htmlFor="research_type" className="field-label">ประเภทงานวิจัย *</label>
            <select
              id="research_type"
              name="research_type"
              defaultValue={project?.research_type ?? "innovation"}
              className="field"
              required
            >
              {options?.research_types.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="organization" className="field-label">หน่วยงาน</label>
            <input
              id="organization"
              name="organization"
              defaultValue={project?.organization ?? "วิทยาลัยเทคนิคร้อยเอ็ด"}
              className="field"
            />
          </div>
        </div>
      </section>

      <section className="panel">
        <h2 className="text-lg font-bold text-[#7a0c22]">2. ผู้จัดทำและข้อมูลประกอบ</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="student_name" className="field-label">ผู้วิจัยหลัก *</label>
            <input id="student_name" name="student_name" defaultValue={project?.student_name} className="field" required />
          </div>
          <div>
            <label htmlFor="researcher_co1" className="field-label">ผู้วิจัยร่วมคนที่ 1</label>
            <input id="researcher_co1" name="researcher_co1" defaultValue={project?.researcher_co1 ?? ""} className="field" />
          </div>
          <div>
            <label htmlFor="researcher_co2" className="field-label">ผู้วิจัยร่วมคนที่ 2</label>
            <input id="researcher_co2" name="researcher_co2" defaultValue={project?.researcher_co2 ?? ""} className="field" />
          </div>
          <div>
            <label htmlFor="funding_by" className="field-label">ผู้สนับสนุนทุน</label>
            <input id="funding_by" name="funding_by" defaultValue={project?.funding_by ?? ""} className="field" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="keywords" className="field-label">คำสำคัญ</label>
            <input id="keywords" name="keywords" defaultValue={project?.keywords} className="field" placeholder="เช่น AI, IoT, หุ่นยนต์" />
          </div>
        </div>
      </section>

      <section className="panel">
        <h2 className="text-lg font-bold text-[#7a0c22]">3. เนื้อหางานวิจัย</h2>
        <div className="mt-5 space-y-4">
          {textAreas.map(([name, label]) => (
            <div key={name}>
              <label htmlFor={name} className="field-label">{label}</label>
              <textarea
                id={name}
                name={name}
                defaultValue={(project?.[name as keyof Project] as string) ?? ""}
                className="field min-h-28"
                required={name === "abstract"}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2 className="text-lg font-bold text-[#7a0c22]">4. เอกสาร PDF</h2>
        <div className="mt-5 rounded-xl border-2 border-dashed border-slate-300 p-6 text-center">
          <FileUp className="mx-auto text-[#7a0c22]" />
          <label className="field-label mt-3" htmlFor="pdf_file">
            เลือกไฟล์ PDF ไม่เกิน 10 MB {project ? "(เว้นว่างเพื่อใช้ไฟล์เดิม)" : "*"}
          </label>
          <input
            id="pdf_file"
            name="pdf_file"
            type="file"
            accept="application/pdf,.pdf"
            className="field"
            required={!project}
          />
        </div>
      </section>

      {error ? <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div> : null}
      <button disabled={submitting || !options} className="button button-primary w-full sm:w-auto">
        <Save size={17} />
        {submitting ? "กำลังบันทึก..." : project ? "บันทึกการแก้ไข" : "ส่งผลงานให้ Admin ตรวจสอบ"}
      </button>
    </form>
  );
}
