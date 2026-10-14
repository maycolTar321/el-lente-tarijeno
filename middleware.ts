import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return res;
  }

  const sb = createServerClient(url, key, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
        cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        cookiesToSet.forEach(({ name, value, options }) =>
          res.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await sb.auth.getUser();

  const path = req.nextUrl.pathname;

  if (path.startsWith("/admin") && path !== "/admin/login" && !user) {
    const u = req.nextUrl.clone();
    u.pathname = "/admin/login";
    return NextResponse.redirect(u);
  }

  if (path === "/admin/login" && user) {
    const u = req.nextUrl.clone();
    u.pathname = "/admin";
    return NextResponse.redirect(u);
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
