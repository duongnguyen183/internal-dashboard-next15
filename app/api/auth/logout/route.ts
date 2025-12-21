import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;

  const res = NextResponse.redirect(new URL("/login", origin));
  res.cookies.set("auth", "false", {
    path: "/",
  });

  return res;
}

export async function POST(req: NextRequest) {
  const origin = req.nextUrl.origin;

  const res = NextResponse.redirect(new URL("/login", origin));
  res.cookies.set("auth", "false", {
    path: "/",
  });

  return res;
}
