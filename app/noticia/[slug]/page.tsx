import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "@/components/Shell";
import { serverSupabase } from "@/lib/supabase-server";
import { dateFmt } from "@/lib/utils";
import type { Article } from "@/app/admin/ui/Dashboard";

export const dynamic = "force-dynamic";

interface StoryProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({
  params,
}: StoryProps): Promise<Metadata> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return { title: "Noticia · EL LENTE TARIJEÑO" };
  }

  try {
    const sb = serverSupabase();
    const { data: a } = await sb
      .from("articles")
      .select("title, summary, cover_image")
      .eq("slug", params.slug)
      .eq("status", "published")
      .maybeSingle();

    if (!a) return { title: "Noticia no encontrada · EL LENTE TARIJEÑO" };

    return {
      title: `${a.title} · EL LENTE TARIJEÑO`,
      description: a.summary,
      openGraph: {
        title: a.title,
        description: a.summary,
        images: a.cover_image ? [{ url: a.cover_image }] : [],
      },
    };
  } catch {
    return { title: "EL LENTE TARIJEÑO" };
  }
}

export default async function Story({ params }: StoryProps) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    notFound();
  }

  const sb = serverSupabase();
  const { data: a } = await sb
    .from("articles")
    .select("*")
    .eq("slug", params.slug)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .maybeSingle<Article>();

  if (!a) {
    notFound();
  }

  // Cargar artículos relacionados
  let related: Article[] = [];
  try {
    const { data: relData } = await sb
      .from("articles")
      .select("*")
      .eq("status", "published")
      .eq("category", a.category)
      .neq("id", a.id)
      .limit(3);
    related = (relData as Article[]) || [];
  } catch {
    related = [];
  }

  return (
    <>
      <Header />
      <main id="top" style={{ padding: "40px 0 70px" }}>
        <div className="wrap">
          <article className="story-container">
            <Link className="story-back-link" href="/">
              ← Volver a la portada principal
            </Link>

            <header className="story-header">
              <span className="eyebrow" style={{ color: "var(--gold)" }}>
                {a.category.toUpperCase()}
              </span>
              <h1>{a.title}</h1>
              <p className="story-lead">{a.summary}</p>
              <div className="story-byline-bar">
                <span>
                  Por <strong>{a.author}</strong> · Publicado el{" "}
                  {dateFmt(a.published_at || a.created_at)}
                </span>
                <span className="eyebrow" style={{ color: "var(--red)", fontSize: "10px", margin: 0 }}>
                  EL LENTE TARIJEÑO
                </span>
              </div>
            </header>

            {a.cover_image && (
              <img
                className="story-main-img"
                src={a.cover_image}
                alt={a.title}
              />
            )}

            <div className="story-prose">{a.content}</div>

            {/* Cita de cierre editorial */}
            <div className="quote" style={{ margin: "40px 0 20px" }}>
              “Donde otros ven una noticia, nosotros ponemos la lupa”.
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "20px", marginTop: "30px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
              <Link href="/" className="btn ghost" style={{ fontSize: "11px", padding: "10px 18px" }}>
                ← Ver más noticias
              </Link>
              <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                EL LENTE TARIJEÑO · Tarija, Bolivia
              </span>
            </div>
          </article>

          {/* Artículos relacionados si existen */}
          {related.length > 0 && (
            <div style={{ maxWidth: "860px", margin: "40px auto 0" }}>
              <div className="heading" style={{ marginBottom: "20px" }}>
                <div className="eyebrow">CONTENIDO RELACIONADO</div>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "24px" }}>
                  Más en {a.category}
                </h3>
              </div>

              <div className="grid">
                {related.map((rel, idx) => (
                  <article className="card" key={rel.id} style={{ padding: "18px" }}>
                    <div className="num">0{idx + 1}</div>
                    <Link href={`/noticia/${rel.slug}`}>
                      <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "17px", margin: "6px 0", color: "var(--white)" }}>
                        {rel.title}
                      </h4>
                    </Link>
                    <p style={{ fontSize: "12.5px" }}>{rel.summary}</p>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
