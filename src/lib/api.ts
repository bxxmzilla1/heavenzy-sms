export const BASE_URL = "https://api.diddysms.com/v1";

export interface Order {
  id: number;
  service: string;
  phone_number: string;
  status: "active" | "completed" | "cancelled" | "expired";
  price: number;
  carrier: string | null;
  sms_code: string | null;
  expires_at: string;
  created_at: string;
}

export interface Service {
  name: string;
  display_name: string;
  price: number;
  available_count: number;
}

export interface Transaction {
  id: number;
  type: "purchase" | "refund" | "deposit";
  amount: number;
  description: string;
  created_at: string;
}

export interface BalanceResponse {
  balance: number;
}

async function request<T>(
  apiKey: string,
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`/api/proxy${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      ...(options?.headers ?? {}),
    },
  });

  const data = await res.json();

  if (!res.ok) {
    const msg =
      data?.detail?.error?.message ?? data?.message ?? "Request failed";
    throw new Error(msg);
  }

  return data as T;
}

export const api = {
  getBalance: (key: string) =>
    request<BalanceResponse>(key, "/balance"),

  getServices: (key: string) =>
    request<{ services: Service[] }>(key, "/services"),

  getService: (key: string, name: string) =>
    request<{ service: Service }>(key, `/services/${name}`),

  getOrders: (key: string) =>
    request<{ orders: Order[] }>(key, "/orders"),

  getOrder: (key: string, id: number) =>
    request<{ order: Order }>(key, `/orders/${id}`),

  createOrder: (key: string, service: string) =>
    request<{ order: Order }>(key, "/orders", {
      method: "POST",
      body: JSON.stringify({ service }),
    }),

  cancelOrder: (key: string, id: number) =>
    request<{ order: Order }>(key, `/orders/${id}/cancel`, {
      method: "POST",
    }),

  completeOrder: (key: string, id: number) =>
    request<{ order: Order }>(key, `/orders/${id}/complete`, {
      method: "POST",
    }),

  reRentOrder: (key: string, id: number) =>
    request<{ order: Order }>(key, `/orders/${id}/re-rent`, {
      method: "POST",
    }),

  getTransactions: (key: string) =>
    request<{ transactions: Transaction[] }>(key, "/transactions"),
};
