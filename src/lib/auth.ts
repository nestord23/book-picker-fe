const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000';

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      createdAt: string;
    };
    token: string;
  };
}

/**
 * Registra un nuevo usuario
 */
export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_URL}/api/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error en el registro');
    }

    // Guardar token en localStorage
    if (data.data?.token) {
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }

    return data;
  } catch (error: any) {
    console.error('Register Error:', error);
    throw new Error(error.message || 'Error de conexión con el servidor');
  }
}

/**
 * Inicia sesión con un usuario existente
 */
export async function login(payload: LoginPayload): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_URL}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error en el login');
    }

    // Guardar token en localStorage
    if (data.data?.token) {
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }

    return data;
  } catch (error: any) {
    console.error('Login Error:', error);
    throw new Error(error.message || 'Error de conexión con el servidor');
  }
}

/**
 * Obtiene el perfil del usuario autenticado
 */
export async function getProfile() {
  const token = getToken();

  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  try {
    const response = await fetch(`${API_URL}/api/users/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        logout();
      }
      throw new Error(data.message || 'Error al obtener perfil');
    }

    return data;
  } catch (error: any) {
    console.error('Get Profile Error:', error);
    throw error;
  }
}

/**
 * Obtiene el token almacenado
 */
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
}

/**
 * Obtiene el usuario almacenado
 */
export function getUser() {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
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
export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
}
