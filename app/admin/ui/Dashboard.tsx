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

const cats = [
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
    if (!confirm(`¿Eliminar “${a.title}”?`)) return;
    if (!sb) return;

    const { error } = await sb.from("articles").delete().eq("id", a.id);
    if (error) {
      setMessage(error.message);
      return;
    }
    setItems(items.filter((x) => x.id !== a.id));
    if (edit?.id === a.id) clear();
    setMessage("Noticia eliminada.");
  }

  async function logout() {
    if (sb) {
      await sb.auth.signOut();
    }
    window.location.href = "/admin/login";
  }

  return (
    <>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "20px 0" }}>
        {[
          ["Artículos", items.length],
          ["Publicados", items.filter((a) => a.status === "published").length],
          ["Borradores", items.filter((a) => a.status === "draft").length],
        ].map((x) => (
          <div className="admincard" key={x[0] as string} style={{ flex: "1 1 140px", margin: 0 }}>
            <span className="small">{x[0]}</span>
            <div className="serif" style={{ fontSize: 32 }}>
              {x[1]}
            </div>
          </div>
        ))}
        <button className="btn dark" onClick={logout}>
          Cerrar sesión
        </button>
      </div>

      <section className="admincard">
        <h2 className="serif">{edit ? "Editar noticia" : "Nueva noticia"}</h2>
        {message && <div className="notice">{message}</div>}
        <form onSubmit={save}>
          <div className="group">
            <label>Titular *</label>
            <input
              className="field"
              required
              maxLength={180}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!edit) setSlug(slugify(e.target.value));
              }}
            />
          </div>

          <div className="formrow">
            <div className="group">
              <label>Slug / URL *</label>
              <input
                className="field"
                required
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
              />
            </div>
            <div className="group">
              <label>Categoría</label>
              <select
                className="field"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {cats.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="group">
            <label>Resumen *</label>
            <textarea
              className="field"
              required
              maxLength={400}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>

          <div className="group">
            <label>Contenido completo *</label>
            <textarea
              className="field"
              required
              minLength={20}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Deja una línea en blanco entre párrafos."
            />
          </div>

          <div className="formrow">
            <div className="group">
              <label>Autor</label>
              <input
                className="field"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>
            <div className="group">
              <label>Imagen de portada (máx. 8 MB)</label>
              <input
                className="field"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          {img && !file && (
            <div className="group">
              <label>Imagen actual</label>
              <img
                src={img}
                alt=""
                style={{ maxWidth: "320px", maxHeight: "180px", objectFit: "cover" }}
              />
              <button
                type="button"
                className="btn light"
                onClick={() => setImg("")}
                style={{ marginTop: 6 }}
              >
                Quitar imagen
              </button>
            </div>
          )}

          <label className="check">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
            />{" "}
            Destacar en portada
          </label>

          <div className="formrow">
            <div className="group">
              <label>Estado</label>
              <select
                className="field"
                value={status}
                onChange={(e) => setStatus(e.target.value as "draft" | "published")}
              >
                <option value="draft">Borrador</option>
                <option value="published">Publicar ahora</option>
              </select>
            </div>
            <div className="group">
              <label>Vista previa URL</label>
              <div className="field">/noticia/{slug || "titular"}</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            <button className="btn" disabled={busy}>
              {busy
                ? "Guardando…"
                : edit
                ? "Guardar cambios"
                : status === "published"
                ? "Publicar noticia"
                : "Guardar borrador"}
            </button>
            <button type="button" className="btn light" onClick={clear}>
              Limpiar
            </button>
          </div>
        </form>
      </section>

      <section className="admincard">
        <h2 className="serif">Noticias y borradores</h2>
        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>Titular</th>
                <th>Estado</th>
                <th>Categoría</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.length ? (
                items.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <strong>{a.title}</strong>
                      {a.featured && <div className="small">★ Destacada</div>}
                    </td>
                    <td>
                      <span className={`status ${a.status}`}>
                        {a.status === "published" ? "Publicado" : "Borrador"}
                      </span>
                    </td>
                    <td>{a.category}</td>
                    <td>{dateFmt(a.published_at || a.created_at)}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <button className="btn light" onClick={() => load(a)}>
                          Editar
                        </button>
                        {a.status === "published" && (
                          <a
                            className="btn light"
                            target="_blank"
                            rel="noreferrer"
                            href={`/noticia/${a.slug}`}
                          >
                            Ver
                          </a>
                        )}
                        <button className="btn dark" onClick={() => remove(a)}>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>Todavía no hay noticias. Crea la primera arriba.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
