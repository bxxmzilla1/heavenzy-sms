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
  carrier_price: number;
  stock: number;
  ttl_minutes: number;
}

export interface ServicesPagination {
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ServicesResponse {
  services: Service[];
  pagination: ServicesPagination;
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

  getServices: (key: string, params?: { search?: string; page?: number; per_page?: number }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set("search", params.search);
    if (params?.page) qs.set("page", String(params.page));
    if (params?.per_page) qs.set("per_page", String(params.per_page));
    const query = qs.toString();
    return request<ServicesResponse>(key, `/services${query ? `?${query}` : ""}`);
  },

  getService: (key: string, name: string) =>
    request<Service>(key, `/services/${name}`),

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
