"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Download, Edit3, ExternalLink, RefreshCw, Shield, Trash2, Users } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { apiFetch, browserApiUrl } from "@/lib/api";
import type { Paginated, Project, User } from "@/types";

export function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [pending, setPending] = useState<Project[]>([]);
  const [approved, setApproved] = useState<Project[]>([]);
  const [approvedCount, setApprovedCount] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pendingResponse, approvedResponse, usersResponse] = await Promise.all([
        apiFetch<Paginated<Project>>("/projects/?approved=false"),
        apiFetch<Paginated<Project>>("/projects/?approved=true"),
        apiFetch<Paginated<User>>("/admin/users/"),
      ]);
      setPending(pendingResponse.results);
      setApproved(approvedResponse.results);
      setApprovedCount(approvedResponse.count);
      setUsers(usersResponse.results);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "โหลดข้อมูลไม่สำเร็จ"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!user?.is_staff) return;
    const timeoutId = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [user, load]);

  async function approve(project: Project) { await apiFetch(`/projects/${project.id}/approve/`, { method: "POST" }); await load(); }
  async function deleteProject(project: Project) { if (!confirm(`ลบ “${project.title_th}” หรือไม่?`)) return; await apiFetch(`/projects/${project.id}/`, { method: "DELETE" }); await load(); }
  async function toggleStaff(target: User) { if (!confirm(`เปลี่ยนสิทธิ์ของ ${target.username} หรือไม่?`)) return; await apiFetch(`/admin/users/${target.id}/toggle_staff/`, { method: "POST" }); await load(); }
  async function deleteUser(target: User) { if (!confirm(`ลบบัญชี ${target.username} หรือไม่?`)) return; await apiFetch(`/admin/users/${target.id}/`, { method: "DELETE" }); await load(); }
  async function resetPassword(target: User) { const password = prompt(`รหัสผ่านใหม่สำหรับ ${target.username} (อย่างน้อย 8 ตัว)`); if (!password) return; await apiFetch(`/admin/users/${target.id}/reset_password/`, { method: "POST", body: JSON.stringify({ password }) }); alert("เปลี่ยนรหัสผ่านแล้ว"); }

  if (authLoading) return <div className="panel text-center text-slate-500">กำลังตรวจสอบสิทธิ์...</div>;
  if (!user?.is_staff) return <div className="panel text-center text-red-700">หน้านี้สำหรับเจ้าหน้าที่ Admin เท่านั้น</div>;
  if (loading) return <div className="panel text-center text-slate-500">กำลังโหลด Dashboard...</div>;
  if (error) return <div className="panel text-center text-red-700">{error}</div>;

  return <div className="space-y-8"><div className="grid gap-4 sm:grid-cols-3"><div className="panel"><span className="text-sm text-slate-500">รออนุมัติ</span><strong className="mt-2 block text-3xl font-black text-amber-600">{pending.length}</strong></div><div className="panel"><span className="text-sm text-slate-500">เผยแพร่แล้ว</span><strong className="mt-2 block text-3xl font-black text-emerald-700">{approvedCount}</strong></div><div className="panel"><span className="text-sm text-slate-500">สมาชิก</span><strong className="mt-2 block text-3xl font-black text-[#7a0c22]">{users.length}</strong></div></div><section className="panel"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-xl font-bold"><Shield className="text-[#7a0c22]" /> ผลงานรอตรวจสอบ</h2><a href={browserApiUrl("/admin/export-csv/")} className="button button-secondary py-2"><Download size={16} /> Export CSV</a></div><div className="space-y-3">{pending.map((project) => <article key={project.id} className="rounded-xl border border-slate-200 p-4"><div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center"><div><h3 className="font-bold">{project.title_th}</h3><p className="mt-1 text-sm text-slate-500">{project.student_name} · {project.department_name} · พ.ศ. {project.academic_year}</p></div><div className="flex flex-wrap gap-2"><Link href={`/projects/${project.id}`} className="button button-secondary py-2"><ExternalLink size={15} /> ตรวจดู</Link><Link href={`/projects/${project.id}/edit`} className="button button-secondary py-2"><Edit3 size={15} /> แก้ไข</Link><button onClick={() => approve(project)} className="button bg-emerald-600 py-2 text-white hover:bg-emerald-700"><CheckCircle2 size={15} /> อนุมัติ</button><button onClick={() => deleteProject(project)} className="button border border-red-200 bg-white py-2 text-red-700"><Trash2 size={15} /> ลบ</button></div></div></article>)}{pending.length === 0 && <p className="py-8 text-center text-sm text-slate-500">ไม่มีผลงานรอตรวจสอบ</p>}</div></section><section className="panel"><h2 className="mb-5 flex items-center gap-2 text-xl font-bold"><CheckCircle2 className="text-emerald-700" /> ผลงานที่เผยแพร่แล้ว</h2><div className="space-y-3">{approved.map((project) => <article key={project.id} className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 p-4 lg:flex-row lg:items-center"><div><h3 className="font-bold">{project.title_th}</h3><p className="mt-1 text-sm text-slate-500">{project.student_name} · ยอดชม {project.views_count} · ดาวน์โหลด {project.download_count}</p></div><div className="flex gap-2"><Link href={`/projects/${project.id}`} className="button button-secondary py-2"><ExternalLink size={15} /> ดู</Link><Link href={`/projects/${project.id}/edit`} className="button button-secondary py-2"><Edit3 size={15} /> แก้ไข</Link><button onClick={() => deleteProject(project)} className="button border border-red-200 bg-white py-2 text-red-700"><Trash2 size={15} /> ลบ</button></div></article>)}{approved.length === 0 && <p className="py-8 text-center text-sm text-slate-500">ยังไม่มีผลงานที่เผยแพร่</p>}</div></section><section className="panel"><h2 className="mb-5 flex items-center gap-2 text-xl font-bold"><Users className="text-[#7a0c22]" /> จัดการสมาชิก</h2><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead><tr className="border-b border-slate-200 text-slate-500"><th className="p-3">ชื่อผู้ใช้</th><th className="p-3">ประเภท</th><th className="p-3">อีเมล</th><th className="p-3">สิทธิ์</th><th className="p-3 text-right">จัดการ</th></tr></thead><tbody>{users.map((target) => <tr key={target.id} className="border-b border-slate-100"><td className="p-3 font-bold">{target.username}</td><td className="p-3">{target.user_type === "student" ? "นักศึกษา" : "บุคคลภายนอก"}</td><td className="p-3">{target.email || "–"}</td><td className="p-3">{target.is_staff ? "Admin" : "สมาชิก"}</td><td className="p-3"><div className="flex justify-end gap-2"><button onClick={() => toggleStaff(target)} disabled={target.id === user.id} className="button button-secondary px-3 py-2"><Shield size={14} /> เปลี่ยนสิทธิ์</button><button onClick={() => resetPassword(target)} className="button button-secondary px-3 py-2"><RefreshCw size={14} /> รหัสผ่าน</button><button onClick={() => deleteUser(target)} disabled={target.id === user.id} className="button border border-red-200 bg-white px-3 py-2 text-red-700"><Trash2 size={14} /></button></div></td></tr>)}</tbody></table></div></section></div>;
}
