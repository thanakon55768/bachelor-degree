import type { Metadata } from "next";
import { ProjectEditLoader } from "@/components/project-edit-loader";

export const metadata: Metadata = { title: "แก้ไขผลงาน" };
type Props = { params: Promise<{ id: string }> };

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params;
  return <div className="page-container py-10 sm:py-14"><h1 className="section-title">แก้ไขผลงาน</h1><p className="mb-8 mt-2 text-slate-500">เจ้าของผลงานหรือ Admin เท่านั้นที่บันทึกการแก้ไขได้</p><ProjectEditLoader id={id} /></div>;
}
