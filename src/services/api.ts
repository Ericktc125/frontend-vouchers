// src/services/api.ts
// 🚨 CAMBIADO A LA IP LOCAL PARA QUE FUNCIONE EN EL CELULAR
// src/services/api.ts
const API_URL = "http://10.0.109.46:5077/api"; 
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error del servidor: ${response.status}`);
    }
    return await response.json();
  } catch (error: any) {
    if (error.message === "Failed to fetch") {
      throw new Error("C# no responde. Revisa la consola de Visual Studio y el Firewall.");
    }
    throw error;
  }
}

// --- ENDPOINTS PÚBLICOS ---
export async function subirVoucher(formData: FormData) {
  return fetchAPI("/vouchers", { method: "POST", body: formData });
}

export async function analizarImagenOCR(formData: FormData) {
  return fetchAPI("/reclamos/analizar-imagen", { method: "POST", body: formData });
}

export async function crearReclamo(data: any) {
  return fetchAPI("/reclamos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

export async function consultarReclamo(codigo: string) {
  return fetchAPI(`/reclamos/${codigo}`);
}

// --- ENDPOINTS DE ADMINISTRADOR ---
export async function loginAdmin(email: string, password: string) {
  return fetchAPI("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
}

export async function obtenerMetricasAdmin() {
  const token = sessionStorage.getItem("admin-token");
  return fetchAPI("/dashboard/metricas", {
    headers: { "Authorization": `Bearer ${token}` }
  });
}

export async function obtenerConsultasPorDia() {
  const token = sessionStorage.getItem("admin-token");
  return fetchAPI("/dashboard/consultas-por-dia", {
    headers: { "Authorization": `Bearer ${token}` }
  });
}

export async function obtenerReclamosAdmin() {
  const token = sessionStorage.getItem("admin-token");
  return fetchAPI("/reclamos", {
    headers: { "Authorization": `Bearer ${token}` }
  });
}

export async function cambiarEstadoReclamo(id: number, nuevoEstado: string, comentarioAdmin?: string) {
  const token = sessionStorage.getItem("admin-token");
  return fetchAPI(`/reclamos/${id}/estado`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ estadoCodigo: nuevoEstado, comentarioAdmin: comentarioAdmin })
  });
}

export async function obtenerDetalleReclamo(id: number) {
  const token = sessionStorage.getItem("admin-token");
  return fetchAPI(`/dashboard/reclamo/${id}`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
}

export async function obtenerVouchersAdmin() {
  const token = sessionStorage.getItem("admin-token");
  return fetchAPI("/admin/vouchers", {
    headers: { "Authorization": `Bearer ${token}` }
  });
}

export async function obtenerHistorialConsultas() {
  const token = sessionStorage.getItem("admin-token");
  return fetchAPI("/dashboard/historial-consultas", {
    headers: { "Authorization": `Bearer ${token}` }
  });
}