"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { browserSupabase } from "@/lib/supabase-browser";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr("");
    setBusy(true);

    try {
      const sb = browserSupabase();
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) {
        setErr("Credenciales incorrectas o usuario no registrado en Supabase Authentication.");
        setBusy(false);
        return;
      }
      window.location.href = "/admin";
    } catch (error: any) {
      setErr(error?.message || "Error al intentar conectar con el servicio de autenticación.");
      setBusy(false);
    }
  }

  return (
    <div className="admin-shell" style={{ display: "flex", flexDirection: "column" }}>
      <header className="admin-header">
        <Link href="/" className="admin-brand">
          <img
            src="/logo.png"
            alt="Logo El Lente Tarijeño"
            width={38}
            height={38}
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              border: "2px solid var(--red)",
              objectFit: "cover",
            }}
          />
          <span>EL LENTE TARIJEÑO</span>
        </Link>
        <Link href="/" className="btn ghost" style={{ padding: "8px 14px", fontSize: "11px" }}>
          ← Volver al portal
        </Link>
      </header>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "30px 20px" }}>
        <div className="login-card">
          <img
            src="/logo.png"
            alt="Logo El Lente Tarijeño"
            width={72}
            height={72}
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              border: "2px solid var(--red)",
              objectFit: "cover",
              margin: "0 auto 16px",
              display: "block",
              boxShadow: "0 0 16px var(--red-glow)",
            }}
          />
          <span className="eyebrow" style={{ color: "var(--gold)", marginBottom: "6px" }}>
            ACCESO RESTRINGIDO
          </span>
          <h1>Panel de Redacción</h1>
          <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "24px" }}>
            Ingreso exclusivo para periodistas y directores de <strong>EL LENTE TARIJEÑO</strong>.
          </p>

          <form onSubmit={submit}>
            <div className="admin-input-group">
              <label htmlFor="login-email">Correo Electrónico</label>
              <input
                id="login-email"
                className="admin-text-field"
                type="email"
                placeholder="redaccion@ellentetarijeno.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="admin-input-group">
              <label htmlFor="login-password">Contraseña</label>
              <input
                id="login-password"
                className="admin-text-field"
                type="password"
                placeholder="••••••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {err && <div className="admin-error-box">{err}</div>}

            <button className="btn" style={{ width: "100%", marginTop: "10px" }} disabled={busy}>
              {busy ? "Verificando acceso…" : "Ingresar a la Redacción ↗"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
