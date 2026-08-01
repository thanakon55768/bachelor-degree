"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, LogIn } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const user = await login(username, password);
      const next = searchParams.get("next");
      router.push(next || (user.is_staff ? "/admin" : "/"));
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  }

  return <div className="page-container grid min-h-[calc(100vh-10rem)] place-items-center py-12"><div className="panel w-full max-w-md"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-red-50 text-[#7a0c22]"><KeyRound /></span><h1 className="mt-5 text-center text-2xl font-black">เข้าสู่ระบบ</h1><p className="mt-2 text-center text-sm text-slate-500">ระบบจะตรวจประเภทบัญชีให้อัตโนมัติ</p>{error && <div className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}<form onSubmit={submit} className="mt-6 space-y-4"><div><label className="field-label" htmlFor="username">ชื่อผู้ใช้หรือรหัสนักศึกษา</label><input id="username" value={username} onChange={(event) => setUsername(event.target.value)} className="field" autoComplete="username" required /></div><div><label className="field-label" htmlFor="password">รหัสผ่าน</label><input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="field" autoComplete="current-password" required /></div><button disabled={submitting} className="button button-primary w-full"><LogIn size={17} /> {submitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}</button></form><div className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm"><Link href="/register" className="font-bold text-[#7a0c22]">สมัครสมาชิก</Link><a href="http://localhost:8000/password-reset/" className="text-slate-500">ลืมรหัสผ่าน</a></div></div></div>;
}
