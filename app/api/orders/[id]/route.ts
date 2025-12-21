// app/api/orders/[id]/route.ts
import { NextResponse } from "next/server";
import {
  deleteOrder,
  updateOrder,
  getOrder,
  type OrderStatus,
} from "@/lib/orders-db";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: Ctx) {
  const { id: raw } = await context.params;
  const id = decodeURIComponent(raw);

  const order = getOrder(id);
  if (!order) {
    return NextResponse.json({ message: "Not found", id }, { status: 404 });
  }

  return NextResponse.json(order);
}

export async function PUT(req: Request, context: Ctx) {
  const { id: raw } = await context.params;
  const id = decodeURIComponent(raw);

  const body = (await req.json().catch(() => ({}))) as {
    customer?: string;
    amount?: number;
    status?: OrderStatus;
  };

  const patch: { customer?: string; amount?: number; status?: OrderStatus } =
    {};

  if (body.customer !== undefined)
    patch.customer = String(body.customer).trim();
  if (body.amount !== undefined) patch.amount = Number(body.amount);
  if (body.status !== undefined) patch.status = body.status;

  const updated = updateOrder(id, patch);

  if (!updated) {
    return NextResponse.json({ message: "Not found", id }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, context: Ctx) {
  const { id: raw } = await context.params;
  const id = decodeURIComponent(raw);

  const ok = deleteOrder(id);
  if (!ok) {
    return NextResponse.json({ message: "Not found", id }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
