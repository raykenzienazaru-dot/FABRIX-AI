import { supabase } from "./supabaseClient";
import { messageInIndonesian } from "./messages";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function readResponse(res: Response) {
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(messageInIndonesian(payload.error));
  }
  return payload;
}

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiGet(path: string) {
  const headers = await authHeader();
  const res = await fetch(`${API_URL}${path}`, { headers, cache: "no-store" });
  return readResponse(res);
}

export async function apiPostJson(path: string, body: unknown) {
  const headers = await authHeader();
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  return readResponse(res);
}

export async function apiPostForm(path: string, formData: FormData) {
  const headers = await authHeader();
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });
  return readResponse(res);
}

export async function apiPatchJson(path: string, body: unknown) {
  const headers = await authHeader();
  const res = await fetch(`${API_URL}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  return readResponse(res);
}
