import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Temporarily disabled middleware-based redirect to avoid client/server redirect loops
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};


