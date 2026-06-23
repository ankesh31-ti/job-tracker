import { Application, ApplicationInput } from "./types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function getPassword(): string {
  return localStorage.getItem("jt_password") || "";
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-app-password": getPassword(),
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    localStorage.removeItem("jt_password");
    window.location.reload();
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

export async function login(password: string): Promise<boolean> {
  const res = await fetch(`${API_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (res.ok) {
    localStorage.setItem("jt_password", password);
    return true;
  }
  return false;
}

export function logout() {
  localStorage.removeItem("jt_password");
}

export function isLoggedIn(): boolean {
  return !!getPassword();
}

export const api = {
  list: () => request<Application[]>("/api/applications"),
  create: (data: ApplicationInput) =>
    request<Application>("/api/applications", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: ApplicationInput) =>
    request<Application>(`/api/applications/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  remove: (id: number) =>
    request<void>(`/api/applications/${id}`, { method: "DELETE" }),
};
