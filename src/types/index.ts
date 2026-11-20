export type IconName = "alert" | "arrow" | "camera" | "chart" | "check" | "clock" | "document" | "eye" | "logout" | "lock" | "mail" | "message" | "refresh" | "search" | "send" | "shield" | "sparkles" | "support" | "trend" | "upload" | "user" | "users" | "x";

export type ApiResult = { 
  estado?: string; 
  mensaje?: string; 
  numero_voucher?: string; 
  monto?: number; 
  fecha?: string; 
  nombre_cliente?: string;
  documento_cliente?: string;
};

export type AdminClaim = {
  id: number;
  codigo: string;
  voucher: string;
  estudiante: string;
  dni: string;
  motivo: string;
  prioridad: string;
  estado: string;
  fecha: string;
};

export type ReclamoResult = {
  codigo: string;
  estudiante: string;
  voucher: string;
  estado: string;
  motivo: string;
  fecha: string;
};