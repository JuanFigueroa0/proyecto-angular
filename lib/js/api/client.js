// src/lib/js/api/client.js
import { isTokenExpired } from "$lib/js/utils/jwt.js";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";
const KEY_SESSION = "ecclesia_session";

// ── Almacenamiento ─────────────────────────────────────────

export async function saveSession(loginResponse) {
  const session = {
    access_token: loginResponse.access_token,
    refresh_token: loginResponse.refresh_token,
    session_token: loginResponse.session_token,
    usuario_id: loginResponse.usuario_id,
    perfil_completo: loginResponse.perfil_completo,
    correo_validado: loginResponse.correo_validado,
    estado: loginResponse.estado,
    persona_id: loginResponse.persona_id,
    roles: loginResponse.roles ?? [],
    permisos: [],
    foto_url: null, // ← se rellena abajo
    guardado_en: Date.now(),
  };

  localStorage.setItem(KEY_SESSION, JSON.stringify(session));

  // Cargar permisos Y foto en paralelo
  try {
    const [permisos, me] = await Promise.all([
      fetchMisPermisos(session.access_token),
      fetch(`${API_BASE}/usuarios/me`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    ]);

    session.permisos = permisos;
    session.foto_url = me?.persona?.foto_url ?? null;
    localStorage.setItem(KEY_SESSION, JSON.stringify(session));
  } catch {
    console.warn("No se pudieron cargar permisos o perfil inicial.");
  }

  return session;
}

/**
 * Actualiza la foto_url en la sesión local sin re-login.
 * Llamar después de subir o eliminar la foto.
 */
export function actualizarFotoEnSesion(foto_url) {
  const session = getSession();
  if (!session) return;
  session.foto_url = foto_url ?? null;
  localStorage.setItem(KEY_SESSION, JSON.stringify(session));
}

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(KEY_SESSION));
  } catch {
    return null;
  }
}

export function getAccessToken() {
  return getSession()?.access_token ?? null;
}
export function getRefreshToken() {
  return getSession()?.refresh_token ?? null;
}
export function clearSession() {
  localStorage.removeItem(KEY_SESSION);
}

export function isAuthenticated() {
  // DESARROLLO: permitir acceso a /app sin validar token
  if (typeof window !== "undefined") {
    const path = window.location.pathname;
    if (path.startsWith("/app")) return true;
  }
  
  const token = getAccessToken();
  return !!token && !isTokenExpired(token);
}

// ── Permisos ───────────────────────────────────────────────

async function fetchMisPermisos(accessToken) {
  try {
    const res = await fetch(`${API_BASE}/permisos/mis-permisos`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) return [];

    const data = await res.json();

    if (Array.isArray(data)) {
      return data
        .map((p) => (typeof p === "string" ? p : p.codigo))
        .filter(Boolean);
    }
    if (data?.permisos) {
      return data.permisos
        .map((p) => (typeof p === "string" ? p : p.codigo))
        .filter(Boolean);
    }
    return [];
  } catch {
    return [];
  }
}

export async function recargarPermisos() {
  const token = getAccessToken();
  if (!token) return [];

  const permisos = await fetchMisPermisos(token);
  const session = getSession();
  if (session) {
    session.permisos = permisos;
    localStorage.setItem(KEY_SESSION, JSON.stringify(session));
  }
  return permisos;
}

// ── Refresh token ──────────────────────────────────────────

let refreshPromise = null;

async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refresh = getRefreshToken();
    if (!refresh) throw new Error("Sin refresh token");

    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    });

    if (!res.ok) {
      clearSession();
      window.location.href = "/auth/login";
      throw new Error("Sesión expirada");
    }

    const data = await res.json();
    const session = getSession() ?? {};

    session.access_token = data.access_token;
    session.refresh_token = data.refresh_token ?? session.refresh_token;
    if (data.session_token) session.session_token = data.session_token;

    localStorage.setItem(KEY_SESSION, JSON.stringify(session));
    return data.access_token;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

// ── apiFetch ───────────────────────────────────────────────

export async function apiFetch(endpoint, options = {}) {
  const {
    method = "GET",
    body = null,
    auth = true,
    headers = {},
    isFormData = false,
  } = options;

  const reqHeaders = { ...headers };
  if (!isFormData) reqHeaders["Content-Type"] = "application/json";

  if (auth) {
    let token = getAccessToken();

    if (token && isTokenExpired(token)) {
      try {
        token = await refreshAccessToken();
      } catch {
        return {
          ok: false,
          error: "Sesión expirada. Inicia sesión nuevamente.",
          status: 401,
        };
      }
    }

    if (token) reqHeaders["Authorization"] = `Bearer ${token}`;
  }

  const config = { method, headers: reqHeaders };
  if (body !== null) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const contentType = res.headers.get("content-type") ?? "";
    const data = contentType.includes("application/json")
      ? await res.json()
      : await res.text();

    if (!res.ok) {
      // Notificar 403 con toast
      if (res.status === 403) {
        import("$lib/js/stores/ui.js")
          .then(({ toast }) => {
            toast.error("No tienes permiso para realizar esta acción.");
          })
          .catch(() => {});
      }

      const errorMsg =
        data?.message ??
        data?.error ??
        (typeof data?.detail === "string" ? data.detail : null) ??
        (typeof data === "string" ? data : `Error ${res.status}`);

      return {
        ok: false,
        error: errorMsg,
        detail: data?.detail ?? null,
        status: res.status,
        data,
      };
    }

    return { ok: true, data, status: res.status };
  } catch {
    return {
      ok: false,
      error: "Error de conexión. Verifica tu internet.",
      status: 0,
    };
  }
}

// ── Métodos de conveniencia ────────────────────────────────
export const api = {
  get: (endpoint, opts = {}) => apiFetch(endpoint, { ...opts, method: "GET" }),
  post: (endpoint, body, opts = {}) =>
    apiFetch(endpoint, { ...opts, method: "POST", body }),
  put: (endpoint, body, opts = {}) =>
    apiFetch(endpoint, { ...opts, method: "PUT", body }),
  patch: (endpoint, body, opts = {}) =>
    apiFetch(endpoint, { ...opts, method: "PATCH", body }),
  delete: (endpoint, opts = {}) =>
    apiFetch(endpoint, { ...opts, method: "DELETE" }),
  upload: (endpoint, formData, opts = {}) =>
    apiFetch(endpoint, {
      ...opts,
      method: "POST",
      body: formData,
      isFormData: true,
    }),
};
