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
    return { title: "Noticia" };
  }

  try {
    const sb = serverSupabase();
    const { data: a } = await sb
      .from("articles")
      .select("title, summary, cover_image")
      .eq("slug", params.slug)
      .eq("status", "published")
      .maybeSingle();

    if (!a) return { title: "Noticia no encontrada" };

    return {
      title: a.title,
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

  return (
    <>
      <Header />
      <main>
        <article className="article">
          <Link className="small" href="/">
            ← Volver a portada
          </Link>
          <p>
            <span className="pill">{a.category}</span>
          </p>
          <h1>{a.title}</h1>
          <p className="summary">{a.summary}</p>
          <p className="small">
            Por <strong>{a.author}</strong> ·{" "}
            {dateFmt(a.published_at || a.created_at)}
          </p>
          {a.cover_image && (
            <img className="cover" src={a.cover_image} alt={a.title} />
          )}
          <div className="bodycopy">{a.content}</div>
          <hr />
          <p className="small">
            EL LENTE TARIJEÑO · Donde otros ven una noticia, nosotros ponemos la
            lupa.
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
