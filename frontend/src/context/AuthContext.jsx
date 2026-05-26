import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  // 1. INICIALIZACIÓN AUTO-SANABLE (Previene el Bucle Infinito)
  const [usuario, setUsuario] = useState(() => {
    try {
      const userGuardado = localStorage.getItem("usuario");
      const tokenGuardado = localStorage.getItem("token");

      // Si falta CUALQUIERA de los dos, o los datos están corruptos, anular sesión.
      if (!userGuardado || userGuardado === "undefined" || userGuardado === "[object Object]" || !tokenGuardado) {
        // Limpieza de emergencia por si quedó un "usuario" atrapado sin token
        localStorage.removeItem("usuario");
        localStorage.removeItem("token");
        return null;
      }
      return JSON.parse(userGuardado);
    } catch (error) {
      console.warn("Memoria corrupta detectada. Limpiando caché...");
      localStorage.removeItem("usuario");
      localStorage.removeItem("token");
      return null;
    }
  });

  // 2. ORDEN CORREGIDO: (Primero datos, luego token)
  const iniciarSesion = (datosUsuario, token) => {
    if (!datosUsuario || !token) return;
    setUsuario(datosUsuario);
    localStorage.setItem("usuario", JSON.stringify(datosUsuario));
    localStorage.setItem("token", token);
  };

  const cerrarSesion = () => {
    // 3. LIMPIEZA SILENCIOSA
    setUsuario(null);
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    localStorage.removeItem("carrito");
    localStorage.removeItem("notifsLeidas");
  };

  return (
    <AuthContext.Provider value={{ usuario, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);