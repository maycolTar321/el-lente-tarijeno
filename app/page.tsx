import Link from "next/link";
import { Header, Footer } from "@/components/Shell";
import { serverSupabase } from "@/lib/supabase-server";
import { dateFmt } from "@/lib/utils";
import type { Article } from "@/app/admin/ui/Dashboard";

export const dynamic = "force-dynamic";

interface HomeProps {
  searchParams: {
    categoria?: string;
    q?: string;
  };
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

export default async function Home({ searchParams }: HomeProps) {
  let articles: Article[] = [];

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    try {
      const sb = serverSupabase();
      const { data } = await sb
        .from("articles")
        .select("*")
        .eq("status", "published")
        .lte("published_at", new Date().toISOString())
        .order("published_at", { ascending: false })
        .limit(80);

      articles = (data as Article[]) || [];
    } catch (e) {
      console.error("Error al cargar artículos de portada:", e);
      articles = [];
    }
  }

  const cat = searchParams?.categoria || "";
  const q = (searchParams?.q || "").toLowerCase();

  const filtered = articles.filter(
    (a) =>
      (!cat || a.category === cat) &&
      (!q || `${a.title} ${a.summary} ${a.content}`.toLowerCase().includes(q))
  );

  const hero = filtered.find((a) => a.featured) || filtered[0];
  const rest = filtered.filter((a) => a.id !== hero?.id);

  return (
    <>
      <Header />
      <main>
        <div className="eyebrow">La portada · Información local</div>
        {hero ? (
          <Link href={`/noticia/${hero.slug}`} className="hero">
            <img
              src={
                hero.cover_image ||
                "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1400&q=85"
              }
              alt={hero.title}
            />
            <div className="hero-copy">
              <span className="pill">{hero.category}</span>
              <h2>{hero.title}</h2>
              <p>{hero.summary}</p>
              <div className="meta">
                {hero.author} · {dateFmt(hero.published_at || hero.created_at)}
              </div>
            </div>
          </Link>
        ) : (
          <div className="empty">
            <h2 className="serif">La noticia comienza aquí.</h2>
            <p>
              Configura Supabase y publica tu primera noticia desde el panel
              editorial.
            </p>
            <Link className="btn" href="/admin/login">
              Entrar al panel
            </Link>
          </div>
        )}

        <div className="section">
          <h2>{cat || q ? "Resultados" : "Últimas noticias"}</h2>
          <span className="meta">{filtered.length} noticias</span>
        </div>

        <div className="filters">
          {cats.map((c) => (
            <Link
              className={cat === c ? "active" : ""}
              key={c}
              href={`/?categoria=${encodeURIComponent(c)}`}
            >
              {c}
            </Link>
          ))}
          <Link href="/">Todas</Link>
        </div>

        <form className="search" action="/">
          <input
            className="field"
            name="q"
            placeholder="Buscar noticias, temas o lugares…"
            defaultValue={searchParams?.q || ""}
          />
          <button className="btn">Buscar</button>
        </form>

        {rest.length ? (
          <div className="grid">
            {rest.map((a) => (
              <article className="card" key={a.id}>
                <Link href={`/noticia/${a.slug}`}>
                  <img
                    src={
                      a.cover_image ||
                      "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=900&q=80"
                    }
                    alt={a.title}
                  />
                </Link>
                <div className="cardbody">
                  <span className="pill">{a.category}</span>
                  <Link href={`/noticia/${a.slug}`}>
                    <h3>{a.title}</h3>
                  </Link>
                  <p>{a.summary}</p>
                  <div className="meta">
                    {a.author} · {dateFmt(a.published_at || a.created_at)}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty">
            No hay más noticias con estos filtros. Publica artículos verificados
            desde el panel.
          </div>
        )}

        <div className="section">
          <h2>Principios editoriales</h2>
        </div>
        <div className="admincard">
          <p>
            Verificamos fuentes, distinguimos hechos de opiniones, procuramos
            dar derecho a respuesta y corregimos errores de forma visible. La
            publicidad debe identificarse claramente.
          </p>
          <Link className="btn dark" href="/principios">
            Leer nuestros principios
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
