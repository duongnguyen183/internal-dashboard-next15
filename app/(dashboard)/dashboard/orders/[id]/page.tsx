// app/(dashboard)/dashboard/orders/[id]/page.tsx
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import OrderEditorClient from "./OrderEditorClient";

type OrderStatus = "Pending" | "Paid" | "Cancelled";

type Order = {
  id: string;
  orderId: string;
  customer: string;
  amount: number;
  status: OrderStatus;
  createdAt: string;
};

async function fetchOrderById(id: string): Promise<Order> {
  const h = await headers();
  const host = h.get("host");
  const proto = process.env.NODE_ENV === "development" ? "http" : "https";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? `${proto}://${host}`;

  const res = await fetch(`${baseUrl}/api/orders/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });

  if (res.status === 404) notFound();
  if (!res.ok) throw new Error(`Failed to fetch order (${res.status})`);

  return (await res.json()) as Order;
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: raw } = await params;
  const id = decodeURIComponent(raw);

  const order = await fetchOrderById(id);
  return <OrderEditorClient initialOrder={order} />;
}
