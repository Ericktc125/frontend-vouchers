// src/features/admin/AdminDashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  cambiarEstadoReclamo, 
  obtenerReclamosAdmin, 
  obtenerMetricasAdmin, 
  obtenerConsultasPorDia, 
  obtenerDetalleReclamo,
  obtenerVouchersAdmin,
  obtenerHistorialConsultas
} from "../../services/api";
import { Icon } from "../../components/Icon";

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  const currentView = location.pathname.includes("reclamos") 
    ? "reclamos" 
    : location.pathname.includes("registros") 
      ? "registros" 
      : location.pathname.includes("consultas")
        ? "consultas"
        : "dashboard";

  const [claims, setClaims] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [consultas, setConsultas] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({ totalConsultas: 0, tiempoPromedioMs: 0, reclamosPendientes: 0 });
  const [porDia, setPorDia] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  
  const [modalData, setModalData] = useState<any>(null);
  const [mostrarInputRechazo, setMostrarInputRechazo] = useState(false);
  const [rechazoMotivo, setRechazoMotivo] = useState("");

  useEffect(() => {
    cargarTodo();
  }, []);

  const cargarTodo = async () => {
    setLoading(true);
    try {
      const dataMetrics = await obtenerMetricasAdmin();
      setMetrics(dataMetrics);
      
      const dataPorDia = await obtenerConsultasPorDia();
      setPorDia(dataPorDia);

      const dataClaims = await obtenerReclamosAdmin();
      setClaims(dataClaims);

      const dataVouchers = await obtenerVouchersAdmin();
      setVouchers(dataVouchers);

      const dataConsultas = await obtenerHistorialConsultas();
      setConsultas(dataConsultas);
    } catch (e: any) {
      console.error("Error al cargar datos:", e);
      if (e.message.includes("401")) {
        alert("Sesión expirada. Vuelve a iniciar sesión.");
        onLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEstado = async (id: number, nuevoEstado: string, motivo?: string) => {
    if (!window.confirm(`¿Cambiar estado a ${nuevoEstado}?`)) return;
    try {
      await cambiarEstadoReclamo(id, nuevoEstado, motivo);
      setModalData(null);
      setMostrarInputRechazo(false);
      setRechazoMotivo("");
      cargarTodo(); 
    } catch (error) {
      alert("Error al actualizar el estado.");
    }
  };

  const verDetalle = async (id: number) => {
    try {
      const detalle = await obtenerDetalleReclamo(id);
      setModalData(detalle);
    } catch (e) {
      alert("No se pudo cargar el detalle");
    }
  };

  const sidebarItemStyle = (view: string) => ({
    display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px",
    background: currentView === view ? "#eef2ff" : "transparent",
    color: currentView === view ? "#2554e8" : "#666",
    borderRadius: "8px", cursor: "pointer", fontWeight: 600, border: "none",
    width: "100%", textAlign: "left" as const, transition: "0.2s"
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f6fa", fontFamily: "'DM Sans', sans-serif" }}>
      
      <aside style={{ width: "260px", background: "white", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "24px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid #e2e8f0" }}>
          <span style={{ background: "#2554e8", color: "white", padding: "8px", borderRadius: "8px" }}><Icon name="shield" size={20} /></span>
          <span style={{ fontWeight: "800", fontSize: "18px", color: "#1e293b" }}>Movilidad Segura</span>
        </div>
        
        <nav style={{ padding: "20px 12px", display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
          <button style={sidebarItemStyle("dashboard")} onClick={() => navigate("/admin/dashboard")}>
            <Icon name="chart" size={20} /> Dashboard
          </button>
          <button style={sidebarItemStyle("reclamos")} onClick={() => navigate("/admin/reclamos")}>
            <Icon name="message" size={20} /> Gestión de Reclamos
            {metrics.reclamosPendientes > 0 && (
              <span style={{ marginLeft: "auto", background: "#ef4444", color: "white", fontSize: "11px", padding: "2px 8px", borderRadius: "10px" }}>
                {metrics.reclamosPendientes}
              </span>
            )}
          </button>
          <button style={sidebarItemStyle("registros")} onClick={() => navigate("/admin/registros")}>
            <Icon name="document" size={20} /> Registros (Vouchers)
          </button>
          
          <button style={sidebarItemStyle("consultas")} onClick={() => navigate("/admin/consultas")}>
            <Icon name="clock" size={20} /> Historial de Consultas
          </button>
        </nav>

        <div style={{ padding: "20px" }}>
          <button onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", background: "#fff1f2", color: "#e11d48", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", width: "100%" }}>
            <Icon name="logout" size={18} /> Cerrar sesión
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
        
        <header style={{ marginBottom: "30px" }}>
          <span style={{ color: "#2554e8", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px" }}>Panel de operaciones</span>
          <h1 style={{ margin: "5px 0", color: "#0f172a", fontSize: "28px" }}>
            {currentView === "dashboard" && "Resumen General"}
            {currentView === "reclamos" && "Gestión de Reclamos"}
            {currentView === "registros" && "Historial de Vouchers"}
            {currentView === "consultas" && "Log de Consultas Realizadas"}
          </h1>
        </header>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Cargando información...</div>
        ) : (
          <>
            {currentView === "dashboard" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "30px" }}>
                  <div style={{ background: "white", padding: "24px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", borderLeft: "6px solid #2554e8" }}>
                    <p style={{ margin: 0, color: "#64748b", fontSize: "14px", fontWeight: 600 }}>Total Consultas</p>
                    <h2 style={{ margin: "10px 0 0", fontSize: "36px", color: "#0f172a" }}>{metrics.totalConsultas}</h2>
                  </div>
                  <div style={{ background: "white", padding: "24px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", borderLeft: "6px solid #f59e0b" }}>
                    <p style={{ margin: 0, color: "#64748b", fontSize: "14px", fontWeight: 600 }}>Tiempo Promedio</p>
                    <h2 style={{ margin: "10px 0 0", fontSize: "36px", color: "#0f172a" }}>{metrics.tiempoPromedioMs} <span style={{ fontSize: "18px", color: "#64748b" }}>ms</span></h2>
                  </div>
                  <div style={{ background: "white", padding: "24px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", borderLeft: "6px solid #ef4444" }}>
                    <p style={{ margin: 0, color: "#64748b", fontSize: "14px", fontWeight: 600 }}>Reclamos Pendientes</p>
                    <h2 style={{ margin: "10px 0 0", fontSize: "36px", color: "#0f172a" }}>{metrics.reclamosPendientes}</h2>
                  </div>
                </div>

                <section style={{ background: "white", borderRadius: "16px", padding: "30px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
                  <h3 style={{ margin: "0 0 25px 0", color: "#1e293b" }}>Volumen de Consultas (Últimos días)</h3>
                  <div style={{ display: "flex", gap: "16px", alignItems: "flex-end", height: "220px", paddingBottom: "10px", borderBottom: "2px solid #f1f5f9" }}>
                    {porDia.length === 0 ? <p style={{ color: "#94a3b8" }}>Sin datos para mostrar.</p> : porDia.map((d, i) => (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "13px", fontWeight: "bold", color: "#2554e8" }}>{d.cantidad}</span>
                        <div style={{ 
                          width: "100%", maxWidth: "60px", 
                          background: "linear-gradient(180deg, #60a5fa 0%, #2554e8 100%)", 
                          borderRadius: "8px 8px 0 0", 
                          height: `${Math.max(15, (d.cantidad / (metrics.totalConsultas || 1)) * 180)}px`,
                          transition: "height 0.5s ease-out"
                        }}></div>
                        <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>{d.fecha}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            {currentView === "reclamos" && (
              <section style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #f1f5f9", textAlign: "left", color: "#64748b", fontSize: "13px" }}>
                        <th style={{ padding: "16px 12px" }}>CÓDIGO</th>
                        <th style={{ padding: "16px 12px" }}>DNI</th>
                        <th style={{ padding: "16px 12px" }}>ESTUDIANTE</th>
                        <th style={{ padding: "16px 12px" }}>ESTADO</th>
                        <th style={{ padding: "16px 12px" }}>ACCIONES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {claims.map((claim) => (
                        <tr key={claim.id} style={{ borderBottom: "1px solid #f1f5f9", fontSize: "14px" }}>
                          <td style={{ padding: "16px 12px", fontWeight: "bold", color: "#1e293b" }}>{claim.codigo}</td>
                          <td style={{ padding: "16px 12px", color: "#475569" }}>{claim.dni}</td>
                          <td style={{ padding: "16px 12px", color: "#475569" }}>{claim.estudiante}</td>
                          <td style={{ padding: "16px 12px" }}>
                            <span style={{ padding: "6px 12px", borderRadius: "20px", background: claim.estado === "RESUELTO" ? "#dcfce7" : claim.estado === "RECHAZADO" ? "#fee2e2" : "#fef3c7", color: claim.estado === "RESUELTO" ? "#166534" : claim.estado === "RECHAZADO" ? "#991b1b" : "#92400e", fontSize: "12px", fontWeight: "bold" }}>
                              {claim.estado}
                            </span>
                          </td>
                          <td style={{ padding: "16px 12px", display: "flex", gap: "8px" }}>
                            <button onClick={() => verDetalle(claim.id)} style={{ background: "#eff6ff", color: "#2554e8", border: "1px solid #bfdbfe", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Ver Detalle</button>
                          </td>
                        </tr>
                      ))}
                      {claims.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>No hay reclamos registrados.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {currentView === "registros" && (
              <section style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #f1f5f9", textAlign: "left", color: "#64748b", fontSize: "13px" }}>
                        <th style={{ padding: "16px 12px" }}>N° OPERACIÓN</th>
                        <th style={{ padding: "16px 12px" }}>CLIENTE</th>
                        <th style={{ padding: "16px 12px" }}>BANCO</th>
                        <th style={{ padding: "16px 12px" }}>MONTO</th>
                        <th style={{ padding: "16px 12px" }}>ESTADO</th>
                        <th style={{ padding: "16px 12px" }}>FECHA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vouchers.map((v) => (
                        <tr key={v.id} style={{ borderBottom: "1px solid #f1f5f9", fontSize: "14px" }}>
                          <td style={{ padding: "16px 12px", fontWeight: "bold", color: "#1e293b" }}>{v.numeroOperacion}</td>
                          <td style={{ padding: "16px 12px", color: "#475569" }}>{v.cliente}<br/><small style={{color: "#94a3b8"}}>{v.dni}</small></td>
                          <td style={{ padding: "16px 12px", color: "#475569" }}>{v.banco}</td>
                          <td style={{ padding: "16px 12px", fontWeight: "bold", color: "#10b981" }}>S/ {v.monto.toFixed(2)}</td>
                          <td style={{ padding: "16px 12px" }}>
                             <span style={{ padding: "6px 12px", borderRadius: "20px", background: "#eff6ff", color: "#2554e8", fontSize: "12px", fontWeight: "bold" }}>{v.estado}</span>
                          </td>
                          <td style={{ padding: "16px 12px", color: "#64748b" }}>{v.fecha}</td>
                        </tr>
                      ))}
                      {vouchers.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>No hay vouchers registrados.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {currentView === "consultas" && (
              <section style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #f1f5f9", textAlign: "left", color: "#64748b", fontSize: "13px" }}>
                        <th style={{ padding: "16px 12px" }}>FECHA Y HORA</th>
                        <th style={{ padding: "16px 12px" }}>VOUCHER</th>
                        <th style={{ padding: "16px 12px" }}>FUENTE</th>
                        <th style={{ padding: "16px 12px" }}>RESULTADO</th>
                        <th style={{ padding: "16px 12px" }}>TIEMPO (ms)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consultas.map((c) => (
                        <tr key={c.id} style={{ borderBottom: "1px solid #f1f5f9", fontSize: "14px" }}>
                          <td style={{ padding: "16px 12px", color: "#475569" }}>{c.fecha}</td>
                          <td style={{ padding: "16px 12px", fontWeight: "bold", color: "#1e293b" }}>{c.voucher}</td>
                          <td style={{ padding: "16px 12px", color: "#64748b" }}>{c.fuente}</td>
                          <td style={{ padding: "16px 12px" }}>
                            <span style={{ padding: "6px 12px", borderRadius: "20px", background: c.resultado === "EXITOSO" ? "#dcfce7" : "#fee2e2", color: c.resultado === "EXITOSO" ? "#166534" : "#991b1b", fontSize: "12px", fontWeight: "bold" }}>
                              {c.resultado}
                            </span>
                          </td>
                          <td style={{ padding: "16px 12px", color: "#2554e8", fontWeight: "bold" }}>{c.tiempoMs} ms</td>
                        </tr>
                      ))}
                      {consultas.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>No hay consultas registradas.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {modalData && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100 }}>
          <div style={{ background: "white", padding: "32px", borderRadius: "16px", width: "550px", maxWidth: "90%", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, color: "#1e293b" }}>Detalle del Reclamo</h2>
              <button onClick={() => { setModalData(null); setMostrarInputRechazo(false); }} style={{ background: "#f1f5f9", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", fontWeight: "bold" }}>X</button>
            </div>
            
            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", marginBottom: "20px" }}>
              <p style={{ margin: "0 0 10px 0", fontSize: "14px" }}><strong>Código:</strong> {modalData.codigo}</p>
              <p style={{ margin: "0 0 10px 0", fontSize: "14px" }}><strong>Voucher:</strong> {modalData.voucher}</p>
              <p style={{ margin: "0 0 10px 0", fontSize: "14px" }}><strong>Motivo:</strong> {modalData.motivo}</p>
              <p style={{ margin: 0, fontSize: "14px" }}><strong>Email:</strong> {modalData.email}</p>
            </div>
            
            <h3 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#64748b" }}>Imagen del Voucher:</h3>
            {modalData.imagen ? (
              <img src={`http://localhost:5077${modalData.imagen}`} alt="Voucher" style={{ width: "100%", borderRadius: "8px", border: "1px solid #e2e8f0", maxHeight: "250px", objectFit: "contain", marginBottom: "20px" }} />
            ) : (
              <div style={{ padding: "20px", textAlign: "center", background: "#f8fafc", borderRadius: "8px", color: "#94a3b8", marginBottom: "20px" }}>El usuario no subió imagen.</div>
            )}

            {mostrarInputRechazo ? (
              <div style={{ background: "#fff1f2", padding: "16px", borderRadius: "8px", border: "1px solid #fecdd3" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#be123c", marginBottom: "8px" }}>
                  Motivo del rechazo (Obligatorio):
                </label>
                <textarea 
                  value={rechazoMotivo} 
                  onChange={(e) => setRechazoMotivo(e.target.value)}
                  placeholder="Ej. La imagen no corresponde al voucher o el monto es incorrecto..."
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #fda4af", minHeight: "80px", marginBottom: "10px", fontFamily: "inherit" }}
                />
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => handleEstado(modalData.id, "RECHAZADO", rechazoMotivo)} style={{ flex: 1, background: "#e11d48", color: "white", border: "none", padding: "10px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Confirmar Rechazo</button>
                  <button onClick={() => setMostrarInputRechazo(false)} style={{ flex: 1, background: "#f1f5f9", color: "#475569", border: "none", padding: "10px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Cancelar</button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => handleEstado(modalData.id, "RESUELTO")} style={{ flex: 1, background: "#10b981", color: "white", border: "none", padding: "12px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "15px" }}>
                  Aprobar Reclamo
                </button>
                <button onClick={() => setMostrarInputRechazo(true)} style={{ flex: 1, background: "#fff1f2", color: "#e11d48", border: "1px solid #fecdd3", padding: "12px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "15px" }}>
                  Rechazar Reclamo
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}