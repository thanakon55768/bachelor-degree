"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileUp, Save } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Project } from "@/types";

const departments = [
  ["EE", "เทคโนโลยีไฟฟ้า"], ["ET", "เทคโนโลยีอิเล็กทรอนิกส์"], ["PT", "เทคโนโลยีการผลิต"], ["MT", "เทคโนโลยีเครื่องกล"], ["CT", "เทคโนโลยีคอมพิวเตอร์"],
];
const researchTypes = [["classroom", "วิจัยในชั้นเรียน"], ["r_d", "วิจัยและพัฒนา (R&D)"], ["innovation", "นวัตกรรมและสิ่งประดิษฐ์"], ["survey", "วิจัยเชิงสำรวจ"], ["other", "อื่น ๆ"]];
const textAreas = [
  ["background", "ความเป็นมา/หลักการและเหตุผล"], ["objectives", "วัตถุประสงค์การวิจัย"], ["scope", "ขอบเขตการวิจัย"], ["abstract", "บทคัดย่อ *"], ["theory", "ทฤษฎีที่เกี่ยวข้อง"], ["methodology", "ระเบียบวิธีวิจัย"], ["results", "ผลการวิจัย"], ["discussion", "อภิปรายผล"], ["suggestions_use", "ข้อเสนอแนะในการนำไปใช้"], ["suggestions_next", "ข้อเสนอแนะสำหรับงานวิจัยครั้งต่อไป"], ["awards", "รางวัลที่ได้รับ"], ["other_info", "ข้อมูลเพิ่มเติม"],
];

export function ProjectForm({ project }: { project?: Project }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const file = formData.get("pdf_file");
    if (file instanceof File && file.size === 0) formData.delete("pdf_file");
    if (file instanceof File && file.size > 10 * 1024 * 1024) {
      setError("ไฟล์ PDF มีขนาดเกิน 10 MB"); setSubmitting(false); return;
    }
    try {
      const saved = await apiFetch<Project>(project ? `/projects/${project.id}/` : "/projects/", { method: project ? "PATCH" : "POST", body: formData });
      router.push(`/projects/${saved.id}`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "บันทึกไม่สำเร็จ");
    } finally { setSubmitting(false); }
  }

  return <form onSubmit={submit} className="space-y-6"><section className="panel"><h2 className="text-lg font-bold text-[#7a0c22]">1. ข้อมูลพื้นฐาน</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><div className="sm:col-span-2"><label className="field-label">ชื่อผลงานภาษาไทย *</label><input name="title_th" defaultValue={project?.title_th} className="field" required /></div><div className="sm:col-span-2"><label className="field-label">ชื่อผลงานภาษาอังกฤษ</label><input name="title_en" defaultValue={project?.title_en ?? ""} className="field" /></div><div><label className="field-label">สาขาวิชา *</label><select name="department" defaultValue={project?.department ?? "CT"} className="field">{departments.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><div><label className="field-label">ปีการศึกษา (พ.ศ.) *</label><input name="academic_year" type="number" defaultValue={project?.academic_year ?? new Date().getFullYear() + 543} className="field" required /></div><div><label className="field-label">ประเภทงานวิจัย *</label><select name="research_type" defaultValue={project?.research_type ?? "innovation"} className="field">{researchTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><div><label className="field-label">หน่วยงาน</label><input name="organization" defaultValue={project?.organization ?? "วิทยาลัยเทคนิคร้อยเอ็ด"} className="field" /></div></div></section><section className="panel"><h2 className="text-lg font-bold text-[#7a0c22]">2. ผู้จัดทำและข้อมูลประกอบ</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><div><label className="field-label">ผู้วิจัยหลัก *</label><input name="student_name" defaultValue={project?.student_name} className="field" required /></div><div><label className="field-label">ผู้วิจัยร่วมคนที่ 1</label><input name="researcher_co1" defaultValue={project?.researcher_co1 ?? ""} className="field" /></div><div><label className="field-label">ผู้วิจัยร่วมคนที่ 2</label><input name="researcher_co2" defaultValue={project?.researcher_co2 ?? ""} className="field" /></div><div><label className="field-label">ผู้สนับสนุนทุน</label><input name="funding_by" defaultValue={project?.funding_by ?? ""} className="field" /></div><div className="sm:col-span-2"><label className="field-label">คำสำคัญ</label><input name="keywords" defaultValue={project?.keywords} className="field" placeholder="เช่น AI, IoT, หุ่นยนต์" /></div></div></section><section className="panel"><h2 className="text-lg font-bold text-[#7a0c22]">3. เนื้อหางานวิจัย</h2><div className="mt-5 space-y-4">{textAreas.map(([name, label]) => <div key={name}><label className="field-label">{label}</label><textarea name={name} defaultValue={project?.[name as keyof Project] as string ?? ""} className="field min-h-28" required={name === "abstract"} /></div>)}</div></section><section className="panel"><h2 className="text-lg font-bold text-[#7a0c22]">4. เอกสาร PDF</h2><div className="mt-5 rounded-xl border-2 border-dashed border-slate-300 p-6 text-center"><FileUp className="mx-auto text-[#7a0c22]" /><label className="field-label mt-3" htmlFor="pdf_file">เลือกไฟล์ PDF ไม่เกิน 10 MB {project ? "(เว้นว่างเพื่อใช้ไฟล์เดิม)" : "*"}</label><input id="pdf_file" name="pdf_file" type="file" accept="application/pdf,.pdf" className="field" required={!project} /></div></section>{error && <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>}<button disabled={submitting} className="button button-primary w-full sm:w-auto"><Save size={17} /> {submitting ? "กำลังบันทึก..." : project ? "บันทึกการแก้ไข" : "ส่งผลงานให้ Admin ตรวจสอบ"}</button></form>;
}
