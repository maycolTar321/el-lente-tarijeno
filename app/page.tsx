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

const pillarsData = [
  { icon: "⌕", title: "Investigación", text: "Documentos, datos, seguimiento y contexto.", query: "Investigación" },
  { icon: "▤", title: "Información", text: "Noticias claras, oportunas y contrastadas.", query: "Política" },
  { icon: "◉", title: "Análisis", text: "Explicar decisiones, discursos y consecuencias.", query: "Tarija" },
  { icon: "♧", title: "Participación", text: "Preguntas, entrevistas y voces ciudadanas.", query: "Sociedad" },
  { icon: "▶", title: "Multimedia", text: "Videos verticales, transmisiones y coberturas en terreno.", query: "Cultura" },
  { icon: "✦", title: "Identidad Tarijeña", text: "Barrios, municipios, el Gran Chaco y provincias.", query: "Gran Chaco" },
];

const weeklyRhythm = [
  { day: "Lunes", title: "La lupa del poder", text: "La noticia principal y su contexto político." },
  { day: "Martes", title: "¿Quién dijo qué?", text: "Declaraciones de autoridades y verificación." },
  { day: "Miércoles", title: "Sin vueltas", text: "Explicaciones directas y datos clave." },
  { day: "Jueves", title: "Entre pasillos", text: "Movimientos en instituciones y concejos." },
  { day: "Viernes", title: "La pregunta incómoda", text: "Voces y cuestionamientos ciudadanos." },
  { day: "Sábado", title: "El bochinche político", text: "Crónica política con perspectiva local." },
  { day: "Domingo", title: "La semana bajo la lupa", text: "Resumen dominical de los hechos decisivos." },
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
    } catch (e: any) {
      if (e?.digest?.startsWith("DYNAMIC_") || e?.digest?.startsWith("NEXT_")) {
        throw e;
      }
      console.error("Error al cargar artículos de portada:", e);
      articles = [];
    }
  }

  const activeCategory = searchParams?.categoria || "";
  const searchQuery = (searchParams?.q || "").toLowerCase().trim();

  // Filtrado de noticias
  const filteredArticles = articles.filter((a) => {
    const matchesCategory =
      !activeCategory || a.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      `${a.title} ${a.summary} ${a.content} ${a.author}`.toLowerCase().includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  // Noticia principal (Hero): la marcada como featured o la más reciente
  const heroArticle = filteredArticles.find((a) => a.featured) || filteredArticles[0];
  const restArticles = filteredArticles.filter((a) => a.id !== heroArticle?.id);

  return (
    <>
      <Header />
      <main id="top">
        {/* ==================================================================
            1. HERO CINEMATOGRÁFICO
            radial-gradient(ellipse at 50% 0, #311012, #08090b 68%)
            ================================================================== */}
        <section className="hero">
          <div className="wrap">
            <div className="eyebrow">TARIJA, BOLIVIA · PERIODISMO DE INVESTIGACIÓN</div>
            <h1>
              LA ACTUALIDAD<br />
              BAJO <span>LA LUPA.</span>
            </h1>
            <p>
              Un medio digital de investigación y análisis para mirar de cerca la política tarijeña,
              fiscalizar los asuntos públicos y abrir una conversación informada con la ciudadanía.
            </p>

            <div className="actions">
              <a className="btn" href="#noticias">
                Descubrir noticias ↓
              </a>
              <Link className="btn ghost" href="/admin/login">
                Acceso a redacción →
              </Link>
            </div>

            {/* Noticia Principal Destacada en la Portada */}
            {heroArticle ? (
              <Link
                href={`/noticia/${heroArticle.slug}`}
                className="hero-news-card"
                aria-label={`Leer titular principal: ${heroArticle.title}`}
              >
                <div className="hero-media-wrap">
                  <img
                    src={
                      heroArticle.cover_image ||
                      "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80"
                    }
                    alt={heroArticle.title}
                  />
                  <div className="hero-media-overlay" />
                </div>
                <div className="hero-news-copy">
                  <span className="eyebrow" style={{ color: "var(--gold)", marginBottom: "4px" }}>
                    {heroArticle.category.toUpperCase()} · NOTICIA DESTACADA
                  </span>
                  <h2 className="hero-news-headline">{heroArticle.title}</h2>
                  <p className="hero-news-lead">{heroArticle.summary}</p>
                  <div className="hero-news-byline">
                    <span>Por <strong>{heroArticle.author}</strong></span>
                    <span>•</span>
                    <span>{dateFmt(heroArticle.published_at || heroArticle.created_at)}</span>
                  </div>
                </div>
              </Link>
            ) : (
              <div
                className="card"
                style={{
                  marginTop: "36px",
                  padding: "48px 24px",
                  textAlign: "center",
                  borderTop: "3px solid var(--red)",
                }}
              >
                <img
                  src="/logo.png"
                  alt="Logo oficial El Lente Tarijeño"
                  width={64}
                  height={64}
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    border: "2px solid var(--red)",
                    margin: "0 auto 16px",
                  }}
                />
                <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "28px", marginBottom: "8px" }}>
                  Edición en Preparación
                </h2>
                <p style={{ maxWidth: "560px", margin: "0 auto 24px", color: "var(--muted)" }}>
                  El sistema periodístico de <strong>EL LENTE TARIJEÑO</strong> está listo y en línea.
                  Ingresa al panel editorial para redactar y publicar las primeras noticias.
                </p>
                <Link href="/admin/login" className="btn btn-gold">
                  Ingresar a la Redacción ↗
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* ==================================================================
            2. BUSCADOR Y RESULTADOS
            ================================================================== */}
        <section id="noticias" style={{ paddingTop: "40px", paddingBottom: "40px" }}>
          <div className="wrap">
            <div className="search-toolbar">
              <form className="search-form-row" action="/#noticias" method="GET" role="search">
                <input
                  name="q"
                  className="search-input"
                  type="search"
                  placeholder="Buscar por titular, actor político, institución o tema de investigación…"
                  defaultValue={searchParams?.q || ""}
                  aria-label="Buscar noticias"
                />
                {activeCategory && <input type="hidden" name="categoria" value={activeCategory} />}
                <button className="search-button" type="submit">
                  Buscar
                </button>
              </form>
            </div>

            <div className="heading">
              <div className="eyebrow">
                {activeCategory
                  ? `SECCIÓN · ${activeCategory.toUpperCase()}`
                  : searchQuery
                  ? `BÚSQUEDA · “${searchQuery}”`
                  : "01 · COBERTURA EN TIEMPO REAL"}
              </div>
              <h2>
                {activeCategory
                  ? `Noticias de ${activeCategory}`
                  : searchQuery
                  ? `Resultados para “${searchQuery}”`
                  : "Últimas Investigaciones y Reportes"}
              </h2>
              <p>
                {filteredArticles.length} {filteredArticles.length === 1 ? "artículo publicado" : "artículos publicados"} en esta sección.
              </p>
            </div>

            {/* Rejilla de Tarjetas (Cards Grid de 3 columnas) */}
            {restArticles.length > 0 ? (
              <div className="grid">
                {restArticles.map((article, idx) => {
                  const numStr = String(idx + 1).padStart(2, "0");
                  return (
                    <article className="card" key={article.id}>
                      <Link href={`/noticia/${article.slug}`} tabIndex={-1} aria-hidden="true">
                        <div className="card-media-box">
                          <img
                            src={
                              article.cover_image ||
                              "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=800&q=80"
                            }
                            alt={article.title}
                            loading="lazy"
                          />
                        </div>
                      </Link>
                      <div className="num">{numStr}</div>
                      <span className="eyebrow" style={{ color: "var(--gold)", fontSize: "9.5px", marginBottom: "4px" }}>
                        {article.category.toUpperCase()}
                      </span>
                      <Link href={`/noticia/${article.slug}`}>
                        <h3>{article.title}</h3>
                      </Link>
                      <p>{article.summary}</p>
                      <div className="card-meta-bottom">
                        <span>Por {article.author}</span>
                        <span>{dateFmt(article.published_at || article.created_at)}</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : heroArticle ? (
              <div className="card" style={{ padding: "30px", textAlign: "center" }}>
                <p style={{ color: "var(--muted)", margin: 0 }}>
                  No se encontraron noticias secundarias adicionales con estos criterios de búsqueda.
                  Puedes seleccionar otra sección o limpiar la búsqueda.
                </p>
                <Link href="/" className="btn ghost" style={{ marginTop: "16px" }}>
                  Ver toda la portada
                </Link>
              </div>
            ) : null}

            {/* Cita Editorial Central */}
            <div className="quote">
              “Donde otros ven una noticia, nosotros ponemos la lupa”.
            </div>
          </div>
        </section>

        {/* ==================================================================
            3. SEIS PILARES EDITORIALES (SECCIÓN CLARA DE CONTRASTE)
            ================================================================== */}
        <section className="light" id="pilares">
          <div className="wrap">
            <div className="heading">
              <div className="eyebrow">02 · Pilares editoriales</div>
              <h2>Seis pilares para contar la realidad.</h2>
              <p>Nuestra cobertura periodística combina investigación profunda, verificación documental y cercanía ciudadana.</p>
            </div>

            <div className="pillars">
              {pillarsData.map((pillar) => (
                <Link
                  key={pillar.title}
                  href={`/?categoria=${encodeURIComponent(pillar.query)}#noticias`}
                  className="pillar"
                  style={{ textDecoration: "none" }}
                >
                  <b>{pillar.icon}</b>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.text}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ==================================================================
            4. CALENDARIO EDITORIAL SEMANAL
            ================================================================== */}
        <section id="calendario">
          <div className="wrap">
            <div className="heading">
              <div className="eyebrow">03 · Calendario editorial</div>
              <h2>Una semana con ritmo propio.</h2>
              <p>Seguimiento continuo de la agenda política, económica y social del departamento de Tarija.</p>
            </div>

            <div className="week">
              {weeklyRhythm.map((item) => (
                <article className="day" key={item.day}>
                  <b>{item.day}</b>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ==================================================================
            5. RIGOR Y CREDIBILIDAD
            ================================================================== */}
        <section className="light" id="credibilidad">
          <div className="wrap two">
            <div>
              <div className="eyebrow">04 · Credibilidad</div>
              <div className="heading">
                <h2>La confianza es el activo más importante.</h2>
              </div>
              <p style={{ color: "#444", fontSize: "15px", lineHeight: "1.6" }}>
                EL LENTE TARIJEÑO es una iniciativa editorial que fundamenta su credibilidad en el rigor técnico,
                la verificación documental y el compromiso innegociable con el derecho de la ciudadanía a recibir información contrastada.
              </p>
              <div style={{ marginTop: "24px" }}>
                <Link href="/principios" className="btn">
                  Conocer nuestros principios éticos →
                </Link>
              </div>
            </div>

            <ul className="checks">
              <li>Contrastar versiones y verificar nombres, fechas y documentos.</li>
              <li>Distinguir rigurosamente la noticia, el análisis y la opinión.</li>
              <li>No presentar acusaciones como hechos probados sin respaldo documental.</li>
              <li>Dar contexto suficiente y evitar titulares engañosos.</li>
              <li>Corregir errores de forma visible, rápida y oportuna.</li>
              <li>Identificar con claridad cualquier publicidad o colaboración.</li>
              <li>Respetar la dignidad de las personas y evitar ataques personales.</li>
            </ul>
          </div>
        </section>

        {/* ==================================================================
            6. CIERRE EDITORIAL CINEMATOGRÁFICO
            background: linear-gradient(120deg, #8d0009, #1a0a0b 70%)
            ================================================================== */}
        <section className="final">
          <div className="wrap">
            <div className="eyebrow" style={{ color: "var(--white)" }}>EL LENTE TARIJEÑO</div>
            <h2>Tarija merece una mirada que vaya más allá del titular.</h2>
            <p>
              Una propuesta de periodismo independiente hecha desde Tarija para informar, investigar,
              escuchar y generar conversación pública con identidad local y responsabilidad ciudadana.
            </p>
            <a className="btn" href="#top">
              Volver al inicio ↑
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
