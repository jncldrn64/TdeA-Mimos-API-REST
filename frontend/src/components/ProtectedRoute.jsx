import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ rolesPermitidos }) {
  const { usuario } = useAuth();
  const token = localStorage.getItem("token");

  // 1. Si no hay sesión (intruso anónimo), patada directa al Login
  if (!usuario || !token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Si la ruta exige roles específicos y el usuario no lo tiene...
  // Patada de regreso a la página de inicio.
  if (rolesPermitidos && !rolesPermitidos.includes(Number(usuario.rol))) {
    return <Navigate to="/" replace />;
  }

  // 3. Si tiene sesión y los permisos correctos, lo dejamos pasar a la vista
  return <Outlet />;
}