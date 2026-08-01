import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth-provider";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "RETC Repository | คลังผลงานวิจัย",
    template: "%s | RETC Repository",
  },
  description: "ระบบสืบค้นและเผยแพร่ผลงานวิจัย วิทยาลัยเทคนิคร้อยเอ็ด",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-500">
            RETC Academic Repository · วิทยาลัยเทคนิคร้อยเอ็ด
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
