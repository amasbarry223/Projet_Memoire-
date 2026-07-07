import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/supabase/types";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";

const PUBLIC_API_PREFIXES = ["/api/n8n/webhook", "/api/health", "/api/config"];

function isPublicApi(pathname: string) {
  if (pathname === "/api") return true;
  // Égalité exacte du segment (pas un simple startsWith) : sans ça, une
  // future route "/api/config-admin" contournerait l'auth par accident.
  return PUBLIC_API_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { pathname } = request.nextUrl;

  const url = getSupabaseUrl();
  const key = getSupabasePublishableKey();
  if (!url || !key) return response;

  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (pathname.startsWith("/api") && !isPublicApi(pathname)) {
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
