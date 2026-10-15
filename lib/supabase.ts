// @ts-nocheck
import { createBrowserClient, createServerClient } from "@supabase/ssr";

export const browserSupabase = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

export function serverSupabase() {
  const { cookies } = require("next/headers");
  const c = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => c.getAll(),
        setAll: (cs) => {
          try {
            cs.forEach((x) => c.set(x.name, x.value, x.options));
          } catch {}
        },
      },
    }
  );
}
