// Server Supabase client for Next.js SSR (proxy, server components, route handlers).
// @supabase/ssr keeps auth cookies in sync with the server response.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, any> }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // The `setAll` method was called from a Server Component or Middleware.
            // In Next.js App Router, cookies can only be modified in a Server Action or Route Handler.
            // Swallowing this error prevents SSR render crashes while allowing auth reading.
          }
        },
      },
    }
  );
}
