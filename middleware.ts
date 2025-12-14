import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware simplificat pentru a preveni erorile legate de redirect-status-code.js
export function middleware(request: NextRequest) {
  // Returnează răspunsul fără modificări pentru a evita erorile interne Next.js
  return NextResponse.next();
}

export const config = {
  // Matcher gol pentru a dezactiva middleware-ul efectiv, dar a preveni erorile
  matcher: [],
};


