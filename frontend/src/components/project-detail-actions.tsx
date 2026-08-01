"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Eye, Heart, MessageCircle, Star } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { apiFetch, browserApiUrl } from "@/lib/api";
import type { Comment, Project } from "@/types";

function CommentItem({ comment, projectId, onChanged }: { comment: Comment; projectId: number; onChanged: () => Promise<void> }) {
  const { user } = useAuth();
  const [replying, setReplying] = useState(false);
  const [reply, setReply] = useState("");

  async function submitReply(event: React.FormEvent) {
    event.preventDefault();
    await apiFetch(`/projects/${projectId}/comments/`, { method: "POST", body: JSON.stringify({ body: reply, parent: comment.id }) });
    setReply("");
    setReplying(false);
    await onChanged();
  }

  async function deleteComment() {
    if (!confirm("ต้องการลบความคิดเห็นนี้หรือไม่?")) return;
    await apiFetch(`/comments/${comment.id}/`, { method: "DELETE" });
    await onChanged();
  }

  return <div className="rounded-xl bg-slate-50 p-4"><div className="flex items-start justify-between gap-3"><div><strong className="text-sm">{comment.username}</strong><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">{comment.body}</p></div><span className="shrink-0 text-xs text-slate-400">{new Date(comment.created_at).toLocaleDateString("th-TH")}</span></div>{user && <div className="mt-2 flex gap-3 text-xs font-bold text-[#7a0c22]"><button type="button" onClick={() => setReplying(!replying)}>ตอบกลับ</button>{(user.username === comment.username || user.is_staff) && <button type="button" onClick={deleteComment}>ลบ</button>}</div>}{replying && <form onSubmit={submitReply} className="mt-3 flex gap-2"><input value={reply} onChange={(event) => setReply(event.target.value)} className="field py-2" placeholder="เขียนคำตอบ..." required /><button className="button button-primary py-2">ส่ง</button></form>}{comment.replies.length > 0 && <div className="mt-3 space-y-3 border-l-2 border-red-100 pl-4">{comment.replies.map((item) => <CommentItem key={item.id} comment={item} projectId={projectId} onChanged={onChanged} />)}</div>}</div>;
}

export function ProjectDetailActions({ initialProject }: { initialProject: Project }) {
  const [project, setProject] = useState(initialProject);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const { user } = useAuth();
  const router = useRouter();

  function requireLogin() {
    if (user) return true;
    router.push(`/login?next=/projects/${project.id}`);
    return false;
  }

  async function refresh() {
    const updated = await apiFetch<Project>(`/projects/${project.id}/`);
    setProject(updated);
  }

  async function toggleFavorite() {
    if (!requireLogin()) return;
    const result = await apiFetch<{ is_favorited: boolean }>(`/projects/${project.id}/favorite/`, { method: "POST" });
    setProject((current) => ({ ...current, is_favorited: result.is_favorited }));
  }

  async function rate(score: number) {
    if (!requireLogin()) return;
    const result = await apiFetch<{ user_rating: number; average_rating: number; total_ratings: number }>(`/projects/${project.id}/rate/`, { method: "POST", body: JSON.stringify({ score }) });
    setProject((current) => ({ ...current, ...result }));
    setMessage("บันทึกคะแนนแล้ว");
  }

  async function submitComment(event: React.FormEvent) {
    event.preventDefault();
    if (!requireLogin()) return;
    await apiFetch(`/projects/${project.id}/comments/`, { method: "POST", body: JSON.stringify({ body: comment }) });
    setComment("");
    await refresh();
  }

  return (
    <>
      <div className="panel mt-6 flex flex-wrap items-center gap-3">
        <button onClick={toggleFavorite} type="button" className={`button ${project.is_favorited ? "button-primary" : "button-secondary"}`}><Heart size={17} className={project.is_favorited ? "fill-current" : ""} /> {project.is_favorited ? "บันทึกแล้ว" : "เพิ่มรายการโปรด"}</button>
        <a href={browserApiUrl(`/projects/${project.id}/preview/`)} target="_blank" rel="noreferrer" className="button button-secondary"><Eye size={17} /> เปิด PDF</a>
        <a href={browserApiUrl(`/projects/${project.id}/download/`)} className="button button-gold"><Download size={17} /> ดาวน์โหลด PDF</a>
        <div className="ml-auto flex items-center gap-1" aria-label="ให้คะแนนผลงาน">{[1, 2, 3, 4, 5].map((score) => <button key={score} type="button" onClick={() => rate(score)} className="p-1" aria-label={`ให้ ${score} ดาว`}><Star size={23} className={score <= project.user_rating ? "fill-amber-400 text-amber-400" : "text-slate-300"} /></button>)}</div>
        {message && <span className="text-xs font-bold text-emerald-700">{message}</span>}
      </div>

      <section className="panel mt-6">
        <h2 className="flex items-center gap-2 text-xl font-bold"><MessageCircle className="text-[#7a0c22]" /> ความคิดเห็น ({project.comments.length})</h2>
        {user ? <form onSubmit={submitComment} className="mt-5 flex flex-col gap-3 sm:flex-row"><textarea value={comment} onChange={(event) => setComment(event.target.value)} className="field min-h-24 flex-1" placeholder="ร่วมแลกเปลี่ยนความคิดเห็นอย่างสุภาพ..." required maxLength={2000} /><button className="button button-primary self-end">ส่งความคิดเห็น</button></form> : <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น ให้คะแนน หรือบันทึกรายการโปรด</p>}
        <div className="mt-6 space-y-4">{project.comments.map((item) => <CommentItem key={item.id} comment={item} projectId={project.id} onChanged={refresh} />)}{project.comments.length === 0 && <p className="py-8 text-center text-sm text-slate-500">ยังไม่มีความคิดเห็น เป็นคนแรกที่เริ่มพูดคุยได้เลย</p>}</div>
      </section>
    </>
  );
}
