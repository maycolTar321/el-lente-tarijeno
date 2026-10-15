"use client";

import { useMemo, useState, FormEvent } from "react";
import { browserSupabase } from "@/lib/supabase-browser";
import { slugify, dateFmt } from "@/lib/utils";

export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  author: string;
  featured: boolean;
  status: "draft" | "published";
  cover_image: string | null;
  published_at: string | null;
  created_at: string;
  updated_at?: string;
}

const categories = [
  "Tarija",
  "Política",
  "Gran Chaco",
  "Provincias",
  "Economía",
  "Sociedad",
  "Cultura",
  "Deportes",
  "Investigación",
];

export default function Dashboard({ initial }: { initial: Article[] }) {
  const [items, setItems] = useState<Article[]>(initial);
  const [edit, setEdit] = useState<Article | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Tarija");
  const [author, setAuthor] = useState("Redacción EL LENTE TARIJEÑO");
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [img, setImg] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const sb = useMemo(() => {
    try {
      return browserSupabase();
    } catch {
      return null;
    }
  }, []);

  function clear() {
    setEdit(null);
    setTitle("");
    setSlug("");
    setSummary("");
    setContent("");
    setCategory("Tarija");
    setAuthor("Redacción EL LENTE TARIJEÑO");
    setFeatured(false);
    setStatus("draft");
    setImg("");
    setFile(null);
  }

  function load(a: Article) {
    setEdit(a);
    setTitle(a.title);
    setSlug(a.slug);
    setSummary(a.summary);
    setContent(a.content);
    setCategory(a.category);
    setAuthor(a.author);
    setFeatured(a.featured);
    setStatus(a.status);
    setImg(a.cover_image || "");
    setFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    setBusy(true);

    if (!sb) {
      setMessage("Error: Supabase no está configurado correctamente.");
      setBusy(false);
      return;
    }

    try {
      let cover = img || null;

      if (file) {
        if (file.size > 8 * 1024 * 1024) {
          throw new Error("La imagen supera el límite de 8 MB.");
        }
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await sb.storage
          .from("article-images")
          .upload(path, file, { contentType: file.type });

        if (uploadError) throw uploadError;
        cover = sb.storage.from("article-images").getPublicUrl(path).data.publicUrl;
      }

      const now = new Date().toISOString();
      const payload = {
        title: title.trim(),
        slug: slugify(slug || title),
        summary: summary.trim(),
        content: content.trim(),
        category,
        author: author.trim(),
        featured,
        status,
        cover_image: cover,
        published_at: status === "published" ? (edit?.published_at || now) : null,
      };

      if (edit) {
        const { data, error } = await sb
          .from("articles")
          .update(payload)
          .eq("id", edit.id)
          .select("*")
          .single();

        if (error) throw error;
        setItems(items.map((x) => (x.id === edit.id ? data : x)));
        setMessage("Noticia actualizada con éxito.");
      } else {
        const { data, error } = await sb
          .from("articles")
          .insert(payload)
          .select("*")
          .single();

        if (error) throw error;
        setItems([data, ...items]);
        setMessage(
          status === "published" ? "Noticia publicada correctamente." : "Borrador guardado."
        );
      }
      clear();
    } catch (e: any) {
      setMessage(e instanceof Error ? e.message : "No se pudo guardar. Revisa la conexión con Supabase.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(a: Article) {
    if (!confirm(`¿Eliminar definitivamente “${a.title}”?`)) return;
    if (!sb) return;

    const { error } = await sb.from("articles").delete().eq("id", a.id);
    if (error) {
      setMessage(error.message);
      return;
    }
    setItems(items.filter((x) => x.id !== a.id));
    if (edit?.id === a.id) clear();
    setMessage("Noticia eliminada correctamente.");
  }

  async function logout() {
    if (sb) {
      await sb.auth.signOut();
    }
    window.location.href = "/admin/login";
  }

  return (
    <>
      {/* Tarjetas de métricas editoriales */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", margin: "18px 0 28px" }}>
        {[
          ["Total de Artículos", items.length],
          ["Publicados en Portada", items.filter((a) => a.status === "published").length],
          ["Borradores en Redacción", items.filter((a) => a.status === "draft").length],
        ].map((x) => (
          <div className="admin-panel-card" key={x[0] as string} style={{ flex: "1 1 150px", margin: 0, padding: 18 }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--gold-accent)", textTransform: "uppercase", letterSpacing: "1px", fontFamily: "var(--font-heading)" }}>
              {x[0]}
            </span>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: "32px", fontWeight: 900, color: "var(--text-primary)", marginTop: 4 }}>
              {x[1]}
            </div>
          </div>
        ))}
        <button className="btn btn-secondary" onClick={logout} style={{ alignSelf: "center", marginLeft: "auto" }}>
          Cerrar Sesión
        </button>
      </div>

      {/* Formulario de redacción */}
      <section className="admin-panel-card">
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "22px", fontWeight: 900, marginBottom: "18px", color: "var(--text-primary)" }}>
          {edit ? "Editar Noticia" : "Redactar Nueva Noticia"}
        </h2>

        {message && <div className="admin-notification">{message}</div>}

        <form onSubmit={save}>
          <div className="admin-field-group">
            <label htmlFor="article-title">Titular Principal *</label>
            <input
              id="article-title"
              className="admin-input"
              required
              maxLength={180}
              placeholder="Ej: Gobernación de Tarija presenta informe financiero de la gestión"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!edit) setSlug(slugify(e.target.value));
              }}
            />
          </div>

          <div className="admin-form-row">
            <div className="admin-field-group">
              <label htmlFor="article-slug">URL / Slug *</label>
              <input
                id="article-slug"
                className="admin-input"
                required
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
              />
            </div>
            <div className="admin-field-group">
              <label htmlFor="article-cat">Categoría Editorial</label>
              <select
                id="article-cat"
                className="admin-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-field-group">
            <label htmlFor="article-summary">Resumen / Bajada de Noticia * (máx. 400 caracteres)</label>
            <textarea
              id="article-summary"
              className="admin-input"
              required
              maxLength={400}
              rows={2}
              style={{ minHeight: "75px" }}
              placeholder="Escribe un sumario directo que sintetice los puntos clave de la noticia..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>

          <div className="admin-field-group">
            <label htmlFor="article-content">Cuerpo Completo de la Noticia *</label>
            <textarea
              id="article-content"
              className="admin-input"
              required
              minLength={20}
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Desarrolla el cuerpo del artículo. Deja una línea en blanco entre párrafos."
            />
          </div>

          <div className="admin-form-row">
            <div className="admin-field-group">
              <label htmlFor="article-author">Autor / Periodista</label>
              <input
                id="article-author"
                className="admin-input"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>
            <div className="admin-field-group">
              <label htmlFor="article-file">Fotografía de Portada (máx. 8 MB)</label>
              <input
                id="article-file"
                className="admin-input"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          {img && !file && (
            <div className="admin-field-group">
              <label>Fotografía Actual</label>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <img
                  src={img}
                  alt="Portada actual"
                  style={{ width: "130px", height: "75px", objectFit: "cover", borderRadius: "4px", border: "1px solid var(--border-subtle)" }}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: "11px", padding: "6px 12px" }}
                  onClick={() => setImg("")}
                >
                  Quitar Imagen
                </button>
              </div>
            </div>
          )}

          <div style={{ margin: "12px 0 18px" }}>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "13px", cursor: "pointer", color: "var(--text-primary)" }}>
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
              />
              <strong>Destacar como Noticia Principal en la Portada</strong>
            </label>
          </div>

          <div className="admin-form-row">
            <div className="admin-field-group">
              <label htmlFor="article-status">Estado de Publicación</label>
              <select
                id="article-status"
                className="admin-input"
                value={status}
                onChange={(e) => setStatus(e.target.value as "draft" | "published")}
              >
                <option value="draft">Borrador (No visible al público)</option>
                <option value="published">Publicado (Visible en el periódico)</option>
              </select>
            </div>
            <div className="admin-field-group">
              <label>Ruta URL de la Noticia</label>
              <div className="admin-input" style={{ backgroundColor: "#0c0e12", color: "var(--gold-accent)" }}>
                /noticia/{slug || "titular-de-ejemplo"}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: "12px" }}>
            <button className="btn" disabled={busy}>
              {busy
                ? "Guardando…"
                : edit
                ? "Guardar Cambios"
                : status === "published"
                ? "Publicar Noticia Ahora"
                : "Guardar como Borrador"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={clear}>
              Limpiar Campos
            </button>
          </div>
        </form>
      </section>

      {/* Tabla de artículos registrados */}
      <section className="admin-panel-card">
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "20px", fontWeight: 900, marginBottom: "16px", color: "var(--text-primary)" }}>
          Noticias Registradas en el Sistema
        </h2>
        <div className="table-overflow">
          <table className="editorial-table">
            <thead>
              <tr>
                <th>Titular</th>
                <th>Estado</th>
                <th>Sección</th>
                <th>Fecha</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.length ? (
                items.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <strong style={{ color: "var(--text-primary)" }}>{a.title}</strong>
                      {a.featured && (
                        <span style={{ marginLeft: 8, fontSize: "10.5px", color: "var(--gold-accent)", fontWeight: 800 }}>
                          ★ DESTACADA
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`status-tag ${a.status}`}>
                        {a.status === "published" ? "Publicado" : "Borrador"}
                      </span>
                    </td>
                    <td>{a.category}</td>
                    <td>{dateFmt(a.published_at || a.created_at)}</td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 8 }}>
                        <button className="btn btn-secondary" style={{ padding: "5px 10px", fontSize: "11px" }} onClick={() => load(a)}>
                          Editar
                        </button>
                        {a.status === "published" && (
                          <a
                            className="btn btn-secondary"
                            style={{ padding: "5px 10px", fontSize: "11px" }}
                            target="_blank"
                            rel="noreferrer"
                            href={`/noticia/${a.slug}`}
                          >
                            Ver
                          </a>
                        )}
                        <button className="btn" style={{ padding: "5px 10px", fontSize: "11px", background: "#8B0000" }} onClick={() => remove(a)}>
                          Borrar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "28px", color: "var(--text-muted)" }}>
                    No hay noticias creadas todavía. Utiliza el formulario superior para redactar tu primera noticia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
