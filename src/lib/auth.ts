// src/lib/auth.ts
const API_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:3000";

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

interface ProfileResponse {
  success: boolean;
  data: User;
}

interface ErrorResponse {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * Registra un nuevo usuario
 */
export async function register(
  payload: RegisterPayload
): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/api/users/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.message || "Error en el registro");
  }

  const data: AuthResponse = await response.json();

  // Guardar token en localStorage
  if (data.data.token) {
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));
    }
  }

  return data;
}

/**
 * Inicia sesión con un usuario existente
 */
export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/api/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.message || "Error en el login");
  }

  const data: AuthResponse = await response.json();

  // Guardar token en localStorage
  if (data.data.token) {
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));
    }
  }

  return data;
}

/**
 * Obtiene el perfil del usuario autenticado
 */
export async function getProfile(): Promise<ProfileResponse> {
  const token = getToken();

  if (!token) {
    throw new Error("No hay token de autenticación");
  }

  const response = await fetch(`${API_URL}/api/users/profile`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();

    // Si el token expiró, limpiar localStorage
    if (
      error.message.includes("expirado") ||
      error.message.includes("inválido")
    ) {
      logout();
    }

    throw new Error(error.message || "Error al obtener perfil");
  }

  return await response.json();
}

/**
 * Obtiene el token almacenado
 */
export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken");
  }
  return null;
}

/**
 * Obtiene el usuario almacenado
 */
export function getUser(): User | null {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }
  return null;
}

/**
 * Verifica si el usuario está autenticado
 */
export function isAuthenticated(): boolean {
  return getToken() !== null;
}

/**
 * Cierra sesión (elimina el token)
 */
export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  }
}

/**
 * Hook para verificar autenticación y redirigir si es necesario
 */
export function requireAuth(): void {
  if (typeof window !== "undefined" && !isAuthenticated()) {
    window.location.href = "/auth/login";
  }
}
