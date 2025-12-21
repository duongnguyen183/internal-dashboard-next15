import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ success: true });

  res.cookies.set("auth", "true", {
    path: "/",
    httpOnly: false, // demo project
  });

  return res;
}
