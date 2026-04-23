export interface Order {
  id: number;
  service: string;
  phone_number: string;
  status: "active" | "completed" | "cancelled" | "expired";
  price: number;
  carrier_price?: number;
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

// Session token is stored in localStorage and sent with every request.
// The server reads the real DIDDYSMS_API_KEY from env variables.
let _sessionToken = "";

export function setSessionToken(token: string) {
  _sessionToken = token;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api/proxy${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-session-token": _sessionToken,
      ...(options?.headers ?? {}),
    },
  });

  const data = await res.json();

  if (!res.ok) {
    const msg =
      data?.detail?.error?.message ?? data?.error ?? data?.message ?? "Request failed";
    throw new Error(msg);
  }

  return data as T;
}

export const api = {
  getBalance: () => request<BalanceResponse>("/balance"),

  getServices: (params?: { search?: string; page?: number; per_page?: number }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set("search", params.search);
    if (params?.page) qs.set("page", String(params.page));
    if (params?.per_page) qs.set("per_page", String(params.per_page));
    const query = qs.toString();
    return request<ServicesResponse>(`/services${query ? `?${query}` : ""}`);
  },

  getService: (name: string) => request<Service>(`/services/${name}`),

  getOrders: () => request<{ orders: Order[] }>("/orders"),

  getOrder: (id: number) => request<{ order: Order }>(`/orders/${id}`),

  createOrder: (service: string) =>
    request<{ order: Order }>("/orders", {
      method: "POST",
      body: JSON.stringify({ service }),
    }),

  cancelOrder: (id: number) =>
    request<{ order: Order }>(`/orders/${id}/cancel`, { method: "POST" }),

  completeOrder: (id: number) =>
    request<{ order: Order }>(`/orders/${id}/complete`, { method: "POST" }),

  reRentOrder: (id: number) =>
    request<{ order: Order }>(`/orders/${id}/re-rent`, { method: "POST" }),

  getTransactions: () => request<{ transactions: Transaction[] }>("/transactions"),
};
