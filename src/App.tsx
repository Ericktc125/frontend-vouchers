// src/App.tsx
import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { PublicPortal } from "./features/public/PublicPortal";
import { AdminLogin } from "./features/auth/AdminLogin";
import { AdminDashboard } from "./features/admin/AdminDashboard";

export default function App() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificamos si hay sesión al cargar la página
  useEffect(() => {
    const token = sessionStorage.getItem("admin-token");
    if (token) setIsAuthenticated(true);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    navigate("/admin/dashboard"); // Redirigimos al panel
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin-token");
    sessionStorage.removeItem("admin-name");
    setIsAuthenticated(false);
    navigate("/login"); // Redirigimos al login
  };

  return (
    <Routes>
      {/* Ruta Pública */}
      <Route path="/" element={<PublicPortal onOpenLogin={() => navigate("/login")} />} />
      
      {/* Ruta de Login */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to="/admin/dashboard" /> : <AdminLogin onLogin={handleLogin} onBack={() => navigate("/")} />
        } 
      />
      
      {/* Rutas de Administrador (Protegidas) */}
      <Route 
        path="/admin/*" 
        element={
          isAuthenticated ? <AdminDashboard onLogout={handleLogout} /> : <Navigate to="/login" />
        } 
      />
    </Routes>
  );
}