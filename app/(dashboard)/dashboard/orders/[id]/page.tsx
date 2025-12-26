// app/(dashboard)/dashboard/orders/[id]/page.tsx
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import OrderEditorClient from "./OrderEditorClient";

export const metadata = {
  title: "Order detail | Internal Dashboard",
  description: "View and edit an order.",
};

type OrderStatus = "Pending" | "Paid" | "Cancelled";

type Order = {
  id: string;
  orderId: string;
  customer: string;
  amount: number;
  status: OrderStatus;
  createdAt: string;
};

function getBaseUrlFromHeaders(h: Headers) {
  // Works on Vercel / proxies too
  const xfProto = h.get("x-forwarded-proto");
  const xfHost = h.get("x-forwarded-host");
  const host = xfHost ?? h.get("host");

  if (!host) return null;

  const proto =
    xfProto ?? (process.env.NODE_ENV === "development" ? "http" : "https");

  return `${proto}://${host}`;
}

async function fetchOrderById(id: string): Promise<Order> {
  const h = await headers();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? getBaseUrlFromHeaders(h);

  const url = baseUrl
    ? `${baseUrl}/api/orders/${encodeURIComponent(id)}`
    : `/api/orders/${encodeURIComponent(id)}`;

  const res = await fetch(url, { cache: "no-store" });

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
