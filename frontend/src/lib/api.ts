const SERVER_API_URL =
  process.env.BACKEND_API_URL ?? "http://localhost:8000/api/v1";

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, data: unknown) {
    super(readErrorMessage(data));
    this.status = status;
    this.data = data;
  }
}

function readErrorMessage(data: unknown): string {
  if (typeof data === "string") return data;
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (typeof record.detail === "string") return record.detail;
    const first = Object.values(record)[0];
    if (Array.isArray(first) && typeof first[0] === "string") return first[0];
  }
  return "เกิดข้อผิดพลาด กรุณาลองใหม่";
}

function apiBase() {
  return typeof window === "undefined" ? SERVER_API_URL : "/backend-api";
}

export function browserApiUrl(path: string) {
  return `/backend-api${path.startsWith("/") ? path : `/${path}`}`;
}

async function responseData(response: Response) {
  if (response.status === 204) return null;
  const contentType = response.headers.get("content-type") ?? "";
  return contentType.includes("application/json")
    ? response.json()
    : response.text();
}

export async function getCsrfToken() {
  const response = await fetch(`${apiBase()}/auth/csrf/`, {
    credentials: "include",
    cache: "no-store",
  });
  const data = (await response.json()) as { csrfToken: string };
  return data.csrfToken;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);
  if (method !== "GET" && method !== "HEAD") {
    headers.set("X-CSRFToken", await getCsrfToken());
  }
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
  });
  const data = await responseData(response);
  if (!response.ok) throw new ApiError(response.status, data);
  return data as T;
}

export async function publicApiFetch<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${SERVER_API_URL}${path}`, {
      cache: "no-store",
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}
