"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const mainSections = [
  { name: "Portada", path: "/" },
  { name: "Investigación", path: "/?categoria=Investigaci%C3%B3n", special: true },
  { name: "Tarija", path: "/?categoria=Tarija" },
  { name: "Política", path: "/?categoria=Pol%C3%ADtica" },
  { name: "Gran Chaco", path: "/?categoria=Gran%20Chaco" },
  { name: "Provincias", path: "/?categoria=Provincias" },
  { name: "Credibilidad", path: "/principios" },
];

const categoryPills = [
  { name: "Todas", query: "" },
  { name: "Tarija", query: "Tarija" },
  { name: "Política", query: "Política" },
  { name: "Gran Chaco", query: "Gran Chaco" },
  { name: "Provincias", query: "Provincias" },
  { name: "Economía", query: "Economía" },
  { name: "Sociedad", query: "Sociedad" },
  { name: "Cultura", query: "Cultura" },
  { name: "Deportes", query: "Deportes" },
  { name: "Investigación", query: "Investigación", special: true },
];

function HeaderContent() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("categoria") || "";

  // Barra de progreso de lectura superior idéntica a la referencia
  useEffect(() => {
    function handleScroll() {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      } else {
        setScrollProgress(0);
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Formato oficial de fecha en español
  const today = new Intl.DateTimeFormat("es-BO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const formattedDate = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <>
      {/* Barra de progreso de scroll interactiva */}
      <div
        className="progress"
        id="progress"
        style={{ width: `${scrollProgress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
      />

      <header className="site-header">
        {/* 1. Franja institucional superior */}
        <div className="topbar">
          <div className="wrap topbar-content">
            <div className="topbar-left">
              <span className="live-beacon" aria-hidden="true" />
              <span className="topbar-location">Tarija, Bolivia</span>
              <span className="topbar-dot">•</span>
              <span className="topbar-date">{formattedDate}</span>
              <span className="topbar-dot">•</span>
              <span className="topbar-motto">POLÍTICA · PODER · LO QUE SE COMENTA</span>
            </div>
            <div className="topbar-right">
              <Link href="/admin/login" className="topbar-access-link">
                <span>🔒</span> Redacción
              </Link>
            </div>
          </div>
        </div>

        {/* 2. Barra de navegación principal y Marca */}
        <nav className="mast-nav" aria-label="Navegación principal">
          <Link href="/" className="brand" onClick={() => setMenuOpen(false)}>
            <img
              src="/logo.png"
              alt="Logo oficial de El Lente Tarijeño"
              width={48}
              height={48}
              style={{
                width: "48px",
                height: "48px",
                objectFit: "cover",
                borderRadius: "50%",
                border: "2px solid var(--red)",
              }}
            />
            <span>
              EL LENTE TARIJEÑO
              <small>POLÍTICA · PODER · LO QUE SE COMENTA</small>
            </span>
          </Link>

          <button
            className="menu"
            id="menu"
            type="button"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>

          <div className={`links ${menuOpen ? "open" : ""}`} id="links">
            {mainSections.map((item) => {
              const isPrinciples = item.path === "/principios" && pathname === "/principios";
              const isCatMatch = item.path.includes("categoria=") && currentCategory && item.path.includes(encodeURIComponent(currentCategory));
              const isHome = item.path === "/" && pathname === "/" && !currentCategory;
              const isActive = isPrinciples || isCatMatch || isHome;

              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`${isActive ? "active" : ""} ${item.special ? "gold-highlight" : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.name}
                </Link>
              );
            })}
            <Link
              href="/admin/login"
              className="btn"
              style={{ padding: "9px 15px", fontSize: "11px" }}
              onClick={() => setMenuOpen(false)}
            >
              Publicar ↗
            </Link>
          </div>
        </nav>

        {/* 3. Sub-barra de categorías temáticas */}
        <div className="category-subnav" aria-label="Categorías del periódico">
          <div className="wrap category-subnav-inner">
            {categoryPills.map((pill) => {
              const isSelected =
                (!currentCategory && pill.query === "") ||
                (currentCategory.toLowerCase() === pill.query.toLowerCase());

              const href = pill.query ? `/?categoria=${encodeURIComponent(pill.query)}` : "/";

              return (
                <Link
                  key={pill.name}
                  href={href}
                  className={`category-link ${isSelected ? "is-active" : ""} ${
                    pill.special ? "special" : ""
                  }`}
                >
                  {pill.name}
                </Link>
              );
            })}
          </div>
        </div>
      </header>
    </>
  );
}

export function Header() {
  return (
    <Suspense fallback={<header className="site-header" style={{ minHeight: "115px", background: "#08090bf2" }} />}>
      <HeaderContent />
    </Suspense>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="wrap footer-top">
        {/* Columna de identidad editorial */}
        <div className="footer-col-main">
          <div className="footer-brand-box">
            <img
              src="/logo.png"
              alt="Logo El Lente Tarijeño"
              width={44}
              height={44}
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                border: "2px solid var(--red)",
                objectFit: "cover",
              }}
            />
            <div>
              <span className="footer-brand-title">EL LENTE TARIJEÑO</span>
              <span className="footer-brand-sub">POLÍTICA · PODER · LO QUE SE COMENTA</span>
            </div>
          </div>
          <p className="footer-text">
            Periódico digital independiente enfocado en la actualidad política, los asuntos públicos,
            la fiscalización ciudadana y la investigación periodística en Tarija, el Gran Chaco y Bolivia.
          </p>
          <div style={{ marginTop: "14px" }}>
            <span className="eyebrow" style={{ fontSize: "10px", marginBottom: "0" }}>
              Donde otros ven una noticia, nosotros ponemos la lupa
            </span>
          </div>
        </div>

        {/* Columna de secciones */}
        <div className="footer-col">
          <h4>Secciones</h4>
          <ul>
            <li><Link href="/?categoria=Investigaci%C3%B3n">Investigación Especial</Link></li>
            <li><Link href="/?categoria=Tarija">Tarija y Sociedad</Link></li>
            <li><Link href="/?categoria=Pol%C3%ADtica">Política y Poder</Link></li>
            <li><Link href="/?categoria=Gran%20Chaco">Gran Chaco</Link></li>
            <li><Link href="/?categoria=Provincias">Provincias</Link></li>
          </ul>
        </div>

        {/* Columna de credibilidad y redacción */}
        <div className="footer-col">
          <h4>Redacción</h4>
          <ul>
            <li><Link href="/principios">Principios y Credibilidad</Link></li>
            <li><Link href="/admin/login">Acceso para Periodistas</Link></li>
            <li><a href="mailto:redaccion@ellentetarijeno.com">redaccion@ellentetarijeno.com</a></li>
            <li><span style={{ color: "#777" }}>Tarija, Estado Plurinacional de Bolivia</span></li>
          </ul>
        </div>
      </div>

      <div className="wrap footer-bottom">
        <div>
          EL LENTE TARIJEÑO · POLÍTICA · PODER · LO QUE SE COMENTA © {currentYear}
        </div>
        <div>
          Periodismo independiente, fiscalización ciudadana y rigor editorial.
        </div>
      </div>
    </footer>
  );
}
