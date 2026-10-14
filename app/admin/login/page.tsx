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
        setErr("No se pudo iniciar sesión. Verifica tus credenciales y el usuario en Supabase.");
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
    <div className="admin">
      <div className="adminbar">
        <Link href="/" className="brand">
          <span className="mark">⌕</span>
          <span className="brandname">EL LENTE TARIJEÑO</span>
        </Link>
        <Link href="/" style={{ color: "white" }}>
          Ver sitio ↗
        </Link>
      </div>
      <section className="login">
        <span className="pill">Acceso restringido</span>
        <h1>Panel editorial</h1>
        <p className="small">
          Ingresa con la cuenta autorizada creada en Supabase Authentication.
        </p>
        <form onSubmit={submit}>
          <div className="group">
            <label>Correo electrónico</label>
            <input
              className="field"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="group">
            <label>Contraseña</label>
            <input
              className="field"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {err && <div className="notice">{err}</div>}
          <button className="btn" style={{ width: "100%" }} disabled={busy}>
            {busy ? "Ingresando…" : "Ingresar al panel"}
          </button>
        </form>
      </section>
    </div>
  );
}
