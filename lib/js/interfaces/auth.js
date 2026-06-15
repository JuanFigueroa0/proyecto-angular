// src/lib/js/interfaces/auth.js
import {
  api,
  saveSession,
  clearSession,
  getRefreshToken,
} from "$lib/js/api/client.js";

// ── Registro ───────────────────────────────────────────────
export async function register({ correo, contrasena }) {
  const r = await api.post(
    "/auth/register",
    { correo, contrasena },
    { auth: false },
  );

  if (r.ok) {
    return {
      ok: true,
      mensaje: r.data?.mensaje ?? "Cuenta creada. Revisa tu correo.",
    };
  }

  return { ok: false, error: r.error, detail: r.detail };
}

// ── Login ──────────────────────────────────────────────────
export async function login({ correo, contrasena }) {
  const r = await api.post(
    "/auth/login",
    { correo, contrasena },
    { auth: false },
  );

  if (r.ok) {
    await saveSession(r.data);
    return { ok: true };
  }

  // Normalizar detail: puede venir como objeto o string
  let detail = r.detail;

  // Si detail es string JSON, parsearlo
  if (typeof detail === "string") {
    try {
      detail = JSON.parse(detail);
    } catch {
      // no era JSON, dejarlo como string
    }
  }

  // Extraer código si detail es objeto
  const codigo =
    typeof detail === "object" && detail !== null ? detail.codigo : null;

  return {
    ok: false,
    error: r.error,
    detail,
    codigo, // CUENTA_INACTIVA | CUENTA_ELIMINADA | null
  };
}

// ── Logout ─────────────────────────────────────────────────
export async function logout() {
  const refresh = getRefreshToken();
  if (refresh) {
    await api.post("/auth/logout", { refresh_token: refresh }).catch(() => {});
  }
  clearSession();
  window.location.href = "/auth/login";
}

// ── Verificación de correo ─────────────────────────────────

/** GET /auth/validar-email?token=xxx */
export async function validarEmailGet(token) {
  const r = await api.get(`/auth/validar-email?token=${token}`, {
    auth: false,
  });
  if (r.ok)
    return {
      ok: true,
      mensaje: r.data?.mensaje ?? "Correo verificado exitosamente.",
    };
  return { ok: false, error: r.error };
}

/** POST /auth/validar-email */
export async function validarEmailPost(token) {
  const r = await api.post("/auth/validar-email", { token }, { auth: false });
  if (r.ok)
    return {
      ok: true,
      mensaje: r.data?.mensaje ?? "Correo verificado exitosamente.",
    };
  return { ok: false, error: r.error };
}

/** POST /auth/reenviar-validacion */
export async function reenviarValidacion(correo) {
  const r = await api.post(
    "/auth/reenviar-validacion",
    { correo },
    { auth: false },
  );
  if (r.ok)
    return { ok: true, mensaje: r.data?.mensaje ?? "Correo reenviado." };
  return { ok: false, error: r.error };
}

// ── Recuperar contraseña ───────────────────────────────────

/** POST /auth/forgot-password */
export async function forgotPassword(correo) {
  const r = await api.post(
    "/auth/forgot-password",
    { correo },
    { auth: false },
  );
  if (r.ok) return { ok: true, mensaje: r.data?.mensaje ?? "Enlace enviado." };
  return { ok: false, error: r.error };
}

/** GET /auth/reset-password?token=xxx */
export async function verificarTokenReset(token) {
  const r = await api.get(`/auth/reset-password?token=${token}`, {
    auth: false,
  });
  if (r.ok) return { ok: true };
  return { ok: false, error: r.error };
}

/** POST /auth/reset-password-confirm */
export async function resetPasswordConfirm({
  token,
  contrasena_nueva,
  confirmar_contrasena,
}) {
  const r = await api.post(
    "/auth/reset-password-confirm",
    { token, contrasena_nueva, confirmar_contrasena },
    { auth: false },
  );
  if (r.ok) return { ok: true };
  return { ok: false, error: r.error };
}

// ── Fortaleza de contraseña ────────────────────────────────
export function passwordStrength(pass) {
  if (!pass) return { score: 0, label: "", bg: "", color: "", esValida: false };

  const checks = {
    length: pass.length >= 6,
    upper: /[A-Z]/.test(pass),
    lower: /[a-z]/.test(pass),
    number: /\d/.test(pass),
    special: /[@$!%*?&_\-.]/.test(pass),
  };

  const score = Object.values(checks).filter(Boolean).length;
  const esValida = Object.values(checks).every(Boolean);

  const niveles = [
    { min: 0, label: "", bg: "", color: "" },
    { min: 1, label: "muy débil", bg: "bg-danger", color: "text-danger" },
    { min: 2, label: "débil", bg: "bg-warning", color: "text-warning" },
    { min: 3, label: "regular", bg: "bg-warning", color: "text-warning" },
    { min: 4, label: "buena", bg: "bg-success", color: "text-success" },
    { min: 5, label: "excelente", bg: "bg-success", color: "text-success" },
  ];

  const nivel =
    [...niveles].reverse().find((n) => score >= n.min) ?? niveles[0];
  return {
    score,
    label: nivel.label,
    bg: nivel.bg,
    color: nivel.color,
    esValida,
  };
}
