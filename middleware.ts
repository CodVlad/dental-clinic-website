import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simplified middleware to prevent errors related to redirect-status-code.js
export function middleware(request: NextRequest) {
  // Returns response without modifications to avoid internal Next.js errors
  return NextResponse.next();
}

export const config = {
  // Empty matcher to effectively disable middleware, but prevent errors
  matcher: [],
};


