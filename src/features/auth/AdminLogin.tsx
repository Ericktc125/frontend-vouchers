import { FormEvent, useState } from "react";
import { loginAdmin } from "../../services/api";
import { Icon } from "../../components/Icon";

export function AdminLogin({ onLogin, onBack }: { onLogin: () => void; onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoginError("");
    try {
      const data = await loginAdmin(email, password);
      sessionStorage.setItem("admin-token", data.token);
      sessionStorage.setItem("admin-name", data.usuario.nombre);
      onLogin();
    } catch (error) {
      setLoginError("El correo o la contraseña no son correctos.");
    }
  };

  return (
    <div className="login-shell" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f4f6fa" }}>
      <section className="login-card" style={{ background: "white", padding: "40px", borderRadius: "15px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", width: "100%", maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <span className="login-icon" style={{ display: "inline-block", background: "#eaf8f2", padding: "15px", borderRadius: "50%", color: "#138a59" }}><Icon name="lock" size={30} /></span>
        </div>
        <h1 style={{ textAlign: "center", marginBottom: "10px" }}>Acceso administrativo</h1>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "20px" }}>Ingresa tus credenciales para gestionar reclamos.</p>
        <form onSubmit={submit} className="login-form">
          <label style={{ display: "block", marginBottom: "15px" }}>
            <span style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: 600 }}>Correo electrónico</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} placeholder="admin@movilidadsegura.pe" />
          </label>
          <label style={{ display: "block", marginBottom: "15px" }}>
            <span style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: 600 }}>Contraseña</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} placeholder="********" />
          </label>
          {loginError && <div style={{ color: "red", fontSize: "13px", marginBottom: "10px" }}>{loginError}</div>}
          <button type="submit" style={{ width: "100%", padding: "12px", background: "#2554e8", color: "white", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
            Ingresar al panel <Icon name="arrow" size={18} style={{ verticalAlign: "middle", marginLeft: "5px" }} />
          </button>
        </form>
        <button onClick={onBack} style={{ marginTop: "15px", width: "100%", padding: "12px", background: "#f4f6fa", border: "1px solid #ccc", borderRadius: "6px", cursor: "pointer" }}>Volver al inicio</button>
      </section>
    </div>
  );
}