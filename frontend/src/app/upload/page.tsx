import type { Metadata } from "next";
import { ProjectForm } from "@/components/project-form";

export const metadata: Metadata = { title: "อัปโหลดผลงาน" };

export default function UploadPage() {
  return <div className="page-container py-10 sm:py-14"><p className="text-sm font-bold text-[#7a0c22]">สำหรับนักศึกษาและเจ้าหน้าที่</p><h1 className="section-title mt-2">เพิ่มผลงานวิจัย</h1><p className="mb-8 mt-2 text-slate-500">เมื่อส่งแล้ว ผลงานจะอยู่ในสถานะ “รอตรวจสอบ” จนกว่า Admin จะอนุมัติ</p><ProjectForm /></div>;
}
