"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [userType, setUserType] = useState<"student" | "guest">("student");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await register({
        username: String(form.get("username") ?? ""),
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
        phone: String(form.get("phone") ?? ""),
        user_type: userType,
      });
      router.push("/login");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "สมัครสมาชิกไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  }

  return <div className="page-container grid place-items-center py-12"><div className="panel w-full max-w-xl"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-red-50 text-[#7a0c22]"><UserPlus /></span><h1 className="mt-5 text-center text-2xl font-black">สมัครสมาชิก</h1><p className="mt-2 text-center text-sm text-slate-500">เจ้าหน้าที่ Admin ต้องสร้างบัญชีผ่านผู้ดูแลระบบ ไม่สามารถสมัครเองได้</p><div className="mt-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1"><button type="button" onClick={() => setUserType("student")} className={`rounded-lg px-3 py-2 text-sm font-bold ${userType === "student" ? "bg-white text-[#7a0c22] shadow" : "text-slate-500"}`}>นักศึกษา</button><button type="button" onClick={() => setUserType("guest")} className={`rounded-lg px-3 py-2 text-sm font-bold ${userType === "guest" ? "bg-white text-[#7a0c22] shadow" : "text-slate-500"}`}>บุคคลภายนอก</button></div>{error && <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}<form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2"><div className="sm:col-span-2"><label htmlFor="username" className="field-label">{userType === "student" ? "รหัสนักศึกษา 11 หลัก" : "ชื่อผู้ใช้"}</label><input id="username" name="username" className="field" inputMode={userType === "student" ? "numeric" : "text"} maxLength={userType === "student" ? 11 : 150} required /></div><div><label htmlFor="email" className="field-label">อีเมล</label><input id="email" name="email" type="email" className="field" required /></div><div><label htmlFor="phone" className="field-label">เบอร์โทร 10 หลัก</label><input id="phone" name="phone" inputMode="numeric" maxLength={10} className="field" /></div><div className="sm:col-span-2"><label htmlFor="password" className="field-label">รหัสผ่านอย่างน้อย 8 ตัว</label><input id="password" name="password" type="password" minLength={8} className="field" required /></div><button disabled={submitting} className="button button-primary sm:col-span-2"><UserPlus size={17} /> {submitting ? "กำลังสมัคร..." : "สร้างบัญชี"}</button></form><p className="mt-5 text-center text-sm text-slate-500">มีบัญชีแล้ว? <Link href="/login" className="font-bold text-[#7a0c22]">เข้าสู่ระบบ</Link></p></div></div>;
}
