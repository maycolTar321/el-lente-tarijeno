import Link from "next/link";
import { redirect } from "next/navigation";
import { serverSupabase } from "@/lib/supabase-server";
import Dashboard from "./ui/Dashboard";

export const dynamic = "force-dynamic";

export default async function Admin() {
  const sb = serverSupabase();
  const {
    data: { user },
  } = await sb.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data } = await sb
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="admin-shell">
      <header className="admin-top-header">
        <Link href="/" className="admin-brand-group">
          <img
            src="/logo.png"
            alt="Logo El Lente Tarijeño"
            width={38}
            height={38}
            style={{ width: "38px", height: "38px", objectFit: "contain" }}
          />
          <span className="admin-brand-text">EL LENTE TARIJEÑO · Redacción</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{user.email}</span>
          <Link href="/" className="btn btn-secondary" style={{ padding: "6px 14px", fontSize: "11px" }}>
            Ver portal ↗
          </Link>
        </div>
      </header>

      <main className="admin-workspace">
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "30px", fontWeight: 900, marginBottom: "6px", color: "var(--text-primary)" }}>
          Panel Editorial
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>
          Administra, redacta y publica las investigaciones y notas de prensa de <strong>EL LENTE TARIJEÑO</strong>.
        </p>
        <Dashboard initial={data || []} />
      </main>
    </div>
  );
}
