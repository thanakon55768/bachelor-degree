"use client";

import { useEffect, useState } from "react";
import { ProjectForm } from "@/components/project-form";
import { apiFetch } from "@/lib/api";
import type { Project } from "@/types";

export function ProjectEditLoader({ id }: { id: string }) {
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { apiFetch<Project>(`/projects/${id}/`).then(setProject).catch((caught) => setError(caught instanceof Error ? caught.message : "โหลดข้อมูลไม่สำเร็จ")); }, [id]);
  if (error) return <div className="panel text-red-700">{error}</div>;
  if (!project) return <div className="panel text-slate-500">กำลังโหลดข้อมูลผลงาน...</div>;
  return <ProjectForm project={project} />;
}
