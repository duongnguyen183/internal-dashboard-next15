"use client";

export default function OrdersError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
      <div className="text-sm font-semibold text-red-800">
        Something went wrong
      </div>
      <div className="mt-1 text-sm text-red-700">{error.message}</div>

      <button
        onClick={reset}
        className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white"
      >
        Try again
      </button>
    </div>
  );
}
