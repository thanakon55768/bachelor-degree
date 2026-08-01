import Link from "next/link";

export default function NotFound() {
  return <div className="page-container py-24 text-center"><div className="text-6xl font-black text-[#7a0c22]">404</div><h1 className="mt-4 text-2xl font-bold">ไม่พบหน้าที่ต้องการ</h1><Link href="/" className="button button-primary mt-6">กลับหน้าแรก</Link></div>;
}
