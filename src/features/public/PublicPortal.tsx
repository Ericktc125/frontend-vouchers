import { FormEvent, useRef, useState } from "react";
import { subirVoucher, analizarImagenOCR, crearReclamo, consultarReclamo } from "../../services/api";
import type { ApiResult, ReclamoResult } from "../../types";
import { Icon } from "../../components/Icon";

export function PublicPortal({ onOpenLogin }: { onOpenLogin: () => void }) {
  const [activeTab, setActiveTab] = useState<"verify" | "claim" | "track">("verify");
  
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark"><Icon name="shield" size={22} /></span>
          <span className="brand-name">Movilidad <strong>Segura</strong></span>
        </div>
        <div className="topbar-actions">
          <div className="secure-label"><Icon name="lock" size={15} /> Sitio seguro</div>
          <button className="admin-access" type="button" onClick={onOpenLogin}><Icon name="users" size={16} /> Administrador</button>
        </div>
      </header>

      <main className="main-content">
        <section className="intro">
          <div className="eyebrow"><span><Icon name="sparkles" size={15} /></span> Validación inteligente</div>
          <h1>Verifica tu voucher<br /><em>en pocos segundos.</em></h1>
          <p>Sube una foto clara de tu comprobante y te diremos si tu pago ya fue registrado.</p>
          
          <div style={{ display: "flex", gap: "10px", marginTop: "20px", flexWrap: "wrap" }}>
            <button onClick={() => setActiveTab("verify")} style={{ padding: "8px 16px", borderRadius: "20px", border: "1px solid #ccc", background: activeTab === "verify" ? "#2554e8" : "white", color: activeTab === "verify" ? "white" : "#333", cursor: "pointer", fontWeight: "bold" }}>1. Verificar Pago</button>
            <button onClick={() => setActiveTab("claim")} style={{ padding: "8px 16px", borderRadius: "20px", border: "1px solid #ccc", background: activeTab === "claim" ? "#2554e8" : "white", color: activeTab === "claim" ? "white" : "#333", cursor: "pointer", fontWeight: "bold" }}>2. Presentar Reclamo</button>
            <button onClick={() => setActiveTab("track")} style={{ padding: "8px 16px", borderRadius: "20px", border: "1px solid #ccc", background: activeTab === "track" ? "#2554e8" : "white", color: activeTab === "track" ? "white" : "#333", cursor: "pointer", fontWeight: "bold" }}>3. Consultar Reclamo</button>
          </div>
        </section>

        <section className="card-wrap">
          <div className="form-card">
            {activeTab === "verify" && <VerificarPago />}
            {activeTab === "claim" && <PresentarReclamo />}
            {activeTab === "track" && <ConsultarEstado />}
          </div>
        </section>
      </main>
    </div>
  );
}

// --------------------------------------------------------------------------
// COMPONENTE 1: VERIFICAR PAGO (SOLO IMAGEN)
// --------------------------------------------------------------------------
function VerificarPago() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [bancoId, setBancoId] = useState("4"); 

  const [step, setStep] = useState<"upload" | "processing" | "result">("upload");
  const [result, setResult] = useState<ApiResult | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!file) { setError("Selecciona una imagen"); return; }

    setStep("processing");
    setError(""); 

    try {
      const formData = new FormData();
      formData.append("Archivo", file);
      formData.append("IdBanco", bancoId); 
      // 🚨 YA NO ENVIAMOS DATOS FALSOS, SOLO LA IMAGEN Y EL BANCO
      
      const data = await subirVoucher(formData);
      
      setResult({
        estado: data.estado,
        numero_voucher: data.numeroOperacion,   
        nombre_cliente: data.nombreCliente,     
        documento_cliente: data.documentoCliente, 
        monto: data.monto,
        fecha: new Date().toISOString()
      });
      
      setStep("result");
    } catch (err: any) {
      setError(err.message || "No se pudo reconocer el voucher o no existe en el sistema."); 
      setStep("upload");
    }
  };

  return (
    <>
      {step === "upload" && (
        <form onSubmit={handleSubmit}>
          <div className="card-heading"><div><span className="step-label">Paso 1</span><h2>Sube tu voucher</h2></div></div>
          
          <div style={{ marginBottom: "15px" }}>
            <select value={bancoId} onChange={(e) => setBancoId(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}>
              <option value="1">BCP</option>
              <option value="2">Interbank</option>
              <option value="3">BBVA</option>
              <option value="4">Scotiabank</option>
              <option value="5">Banco de la Nación</option>
            </select>
          </div>

          <div className="drop-zone" onClick={() => inputRef.current?.click()} style={{ cursor: "pointer", padding: "40px 20px", textAlign: "center", border: "2px dashed #ccc", borderRadius: "10px" }}>
            <input ref={inputRef} type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} accept="image/*,.pdf" style={{ display: "none" }} />
            <span className="upload-icon" style={{ display: "block", marginBottom: "10px" }}><Icon name="upload" size={30} /></span>
            <strong>{file ? file.name : "Arrastra tu voucher aquí"}</strong>
            <p style={{ color: "#666" }}>o haz clic para buscarlo</p>
          </div>
          {error && <p style={{ color: "#c63d45", background: "#fff0f1", padding: "10px", borderRadius: "6px", marginTop: "15px", fontSize: "14px" }}>{error}</p>}
          <button type="submit" style={{ marginTop: "20px", width: "100%", padding: "12px", background: "#2554e8", color: "white", border: 0, borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>Verificar Pago</button>
        </form>
      )}
      {step === "processing" && <div style={{ textAlign: "center", padding: "40px" }}><h2>Analizando imagen...</h2><p>La IA está extrayendo los datos del comprobante.</p></div>}
      {step === "result" && result && (
        <div style={{ textAlign: "center" }}>
          <h2 style={{ color: result.estado === "ACTIVO" ? "#138a59" : "#c63d45" }}>{result.estado === "ACTIVO" ? "¡Pago Aprobado!" : "No encontrado"}</h2>
          {result.estado === "ACTIVO" && (
             <div style={{ marginTop: "20px" }}>
               <div style={{ background: "#f4f6fa", padding: "15px", borderRadius: "8px", textAlign: "left" }}>
                 <p><strong>Estudiante:</strong> {result.nombre_cliente}</p>
                 <p><strong>DNI:</strong> {result.documento_cliente}</p>
                 <p><strong>Voucher:</strong> {result.numero_voucher}</p>
               </div>
               <div style={{ marginTop: "20px", padding: "15px", background: "#eaf8f2", borderLeft: "4px solid #138a59", borderRadius: "8px", textAlign: "left" }}>
                 <p style={{ margin: 0, color: "#138a59", fontWeight: "bold" }}>¡Todo listo!</p>
                 <p style={{ margin: "5px 0 0 0", fontSize: "14px" }}>Acércate a la Gerencia Regional de Transportes y Comunicaciones de La Libertad.</p>
               </div>
               <iframe src="https://maps.google.com/maps?q=Gerencia%20Regional%20de%20Transportes%20y%20Comunicaciones%20de%20La%20Libertad&t=&z=16&ie=UTF8&iwloc=&output=embed" width="100%" height="200" style={{ border: 0, marginTop: "15px", borderRadius: "8px" }} title="Mapa"></iframe>
             </div>
          )}
          <button onClick={() => setStep("upload")} style={{ marginTop: "20px", padding: "10px", width: "100%", cursor: "pointer", background: "#fff", border: "1px solid #ccc", borderRadius: "6px" }}>Verificar otro</button>
        </div>
      )}
    </>
  );
}

// (El componente PresentarReclamo y ConsultarEstado se mantienen igual que antes, no necesitan cambios para esta prueba)
function PresentarReclamo() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"upload" | "scanning" | "extracted" | "sending" | "success">("upload");
  const [ocrData, setOcrData] = useState<any>(null);
  const [form, setForm] = useState({ email: "", celular: "", motivo: "BANCO_YA_DESCONTO" });
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScanImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setStatus("scanning");
    setError("");
    try {
      const formData = new FormData();
      formData.append("Imagen", selectedFile); 
      const data = await analizarImagenOCR(formData);
      setOcrData(data);
      setStatus("extracted");
    } catch (err: any) {
      setError(err.message);
      setStatus("upload");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      await crearReclamo({
        NumeroOperacion: ocrData.numeroOperacion,
        EmailContacto: form.email,
        CelularContacto: form.celular,
        MotivoCodigo: form.motivo,
        Descripcion: "El estudiante presentó un reclamo vía OCR."
      });
      setStatus("success");
    } catch (err: any) {
      setError("Error al crear el reclamo. Intenta de nuevo.");
      setStatus("extracted");
    }
  };

  if (status === "success") {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <Icon name="check" size={50} color="#138a59" />
        <h2>¡Reclamo registrado!</h2>
        <p>Nuestro equipo revisará tu caso y te contactará pronto.</p>
        <button onClick={() => window.location.reload()} style={{ marginTop: "20px", padding: "10px", cursor: "pointer", background: "#2554e8", color: "#fff", border: "none", borderRadius: "6px" }}>Volver al inicio</button>
      </div>
    );
  }

  return (
    <div>
      <div className="card-heading"><div><span className="step-label">Paso 2</span><h2>Presentar un Reclamo</h2></div></div>
      {status === "upload" && (
        <>
          <p style={{ color: "#666", marginBottom: "20px" }}>Si tu voucher no fue reconocido, sube una nueva foto aquí. La IA intentará extraer los datos automáticamente.</p>
          <div onClick={() => fileInputRef.current?.click()} style={{ border: "2px dashed #2554e8", padding: "40px 20px", borderRadius: "10px", textAlign: "center", cursor: "pointer", background: "#f8faff" }}>
            <input type="file" ref={fileInputRef} onChange={handleScanImage} accept="image/*" style={{ display: "none" }} />
            <Icon name="sparkles" size={40} color="#2554e8" />
            <h3 style={{ margin: "15px 0 5px 0", color: "#2554e8" }}>Haz clic para subir tu voucher</h3>
            <p style={{ color: "#666", fontSize: "13px", margin: 0 }}>La IA analizará la imagen y buscará tu pago.</p>
          </div>
          {error && <div style={{ background: "#fff0f1", color: "#c63d45", padding: "10px", borderRadius: "6px", marginTop: "15px", fontSize: "13px" }}>{error}</div>}
        </>
      )}
      {status === "scanning" && (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ width: "80px", height: "80px", border: "4px solid #f3f3f3", borderTop: "4px solid #2554e8", borderRadius: "50%", margin: "0 auto 20px auto", animation: "spin 1s linear infinite" }}></div>
          <h3>Analizando imagen...</h3>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      )}
      {status === "extracted" && ocrData && (
        <form onSubmit={handleSubmit}>
          <div style={{ background: "#eaf8f2", color: "#138a59", padding: "15px", borderRadius: "8px", marginBottom: "20px", borderLeft: "4px solid #138a59" }}>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "15px", display: "flex", alignItems: "center", gap: "5px" }}><Icon name="check" size={18} /> Datos extraídos por la IA:</h3>
            <p style={{ margin: 0, fontSize: "13px" }}><strong>N° Operación:</strong> {ocrData.numeroOperacion}</p>
            <p style={{ margin: 0, fontSize: "13px" }}><strong>Estudiante:</strong> {ocrData.nombreCliente}</p>
          </div>
          <label style={{ display: "block", marginBottom: "10px" }}>Correo Electrónico
            <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={{ width: "100%", padding: "10px", marginTop: "5px", border: "1px solid #ccc", borderRadius: "6px" }} placeholder="tu@correo.com" />
          </label>
          <button type="submit" disabled={status === "sending"} style={{ width: "100%", padding: "12px", background: "#138a59", color: "white", border: 0, borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
            {status === "sending" ? "Enviando..." : "Confirmar y Enviar Reclamo"}
          </button>
        </form>
      )}
    </div>
  );
}

function ConsultarEstado() {
  const [codigo, setCodigo] = useState("");
  const [result, setResult] = useState<ReclamoResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await consultarReclamo(codigo);
      setResult(data);
    } catch (err) {
      setError("No encontramos ningún reclamo con ese código.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="card-heading"><div><span className="step-label">Paso 3</span><h2>Consultar Reclamo</h2></div></div>
      <p style={{ color: "#666", marginBottom: "20px" }}>Ingresa el código que te enviamos por correo.</p>
      <form onSubmit={handleSearch} style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input type="text" value={codigo} onChange={e => setCodigo(e.target.value)} placeholder="Ej. REC-2026-1234" required style={{ flex: 1, padding: "12px", border: "1px solid #ccc", borderRadius: "6px" }} />
        <button type="submit" disabled={loading} style={{ padding: "12px 20px", background: "#2554e8", color: "white", border: 0, borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>{loading ? "Buscando..." : "Buscar"}</button>
      </form>
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
      {result && (
        <div style={{ background: "#f8f9fa", padding: "20px", borderRadius: "8px", border: "1px solid #ddd" }}>
          <p><strong>Estado:</strong> {result.estado}</p>
          <p><strong>Estudiante:</strong> {result.estudiante}</p>
          <p><strong>Voucher:</strong> {result.voucher}</p>
        </div>
      )}
    </div>
  );
}