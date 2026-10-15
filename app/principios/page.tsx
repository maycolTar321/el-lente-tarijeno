import Link from "next/link";
import { Header, Footer } from "@/components/Shell";

export const dynamic = "force-dynamic";

export default function Principles() {
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
                DECLARACIÓN EDITORIAL Y CÓDIGO DE ÉTICA
              </span>
              <h1>La confianza es el activo más importante</h1>
              <p className="story-lead">
                Una mirada crítica gana fuerza cuando se sostiene en hechos, documentos, fuentes identificables y responsabilidad pública ante el pueblo de Tarija y Bolivia.
              </p>
            </header>

            <div className="quote">
              “Donde otros ven una noticia, nosotros ponemos la lupa”.
            </div>

            <div className="story-prose">
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "22px", margin: "24px 0 12px", color: "var(--white)" }}>
                Nuestros 7 Compromisos Inquebrantables
              </h3>
              <ul className="checks">
                <li>
                  <strong>Contrastar versiones y verificar datos:</strong> cotejamos nombres, cifras, fechas y documentos oficiales antes de publicar cualquier información.
                </li>
                <li>
                  <strong>Distinción rigurosa de géneros:</strong> diferenciamos de manera inequívoca la noticia fáctica, el análisis periodístico, la columna de opinión y la sátira política.
                </li>
                <li>
                  <strong>Presunción de inocencia y rigor probatorio:</strong> no presentamos acusaciones ni denuncias como hechos probados sin un respaldo documental fehaciente.
                </li>
                <li>
                  <strong>Contexto frente al sensacionalismo:</strong> explicamos las causas y consecuencias de los acontecimientos, rechazando titulares engañosos o diseñados para el clickbait.
                </li>
                <li>
                  <strong>Rectificación transparente y oportuna:</strong> si cometemos una imprecisión, la corregimos de forma inmediata, visible y con una nota aclaratoria para nuestros lectores.
                </li>
                <li>
                  <strong>Transparencia publicitaria y patrocinio:</strong> cualquier contenido institucional, comercial o de patrocinio está claramente identificado frente a la línea editorial independiente.
                </li>
                <li>
                  <strong>Respeto y dignidad:</strong> ejercemos el periodismo de fiscalización sobre el poder y los actos públicos, evitando los ataques personales y respetando la privacidad.
                </li>
              </ul>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "24px", marginTop: "40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
              <Link href="/" className="btn">
                Ir a la portada de noticias →
              </Link>
              <Link href="/admin/login" className="btn ghost" style={{ fontSize: "11px" }}>
                Acceso a redacción
              </Link>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
