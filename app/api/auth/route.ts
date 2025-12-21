import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    message: "Login success",
  });

  response.cookies.set("token", "fake-token", {
    httpOnly: true,
    path: "/",
  });

  return response;
}
