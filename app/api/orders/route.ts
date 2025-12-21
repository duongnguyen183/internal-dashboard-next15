// app/api/orders/route.ts
import { NextResponse } from "next/server";
import { createOrder, listOrders } from "@/lib/orders-db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 10);

  const data = listOrders({ q, page, limit });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    customer?: string;
    amount?: number;
    status?: "Pending" | "Paid" | "Cancelled";
  };

  const created = createOrder(body);
  return NextResponse.json(created, { status: 201 });
}
