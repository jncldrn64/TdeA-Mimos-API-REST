import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  
  // 1. INICIALIZACIÓN AUTO-SANABLE (Previene pantallas blancas)
  const [usuario, setUsuario] = useState(() => {
    try {
      const userGuardado = localStorage.getItem("usuario");
      // Prevenir el crash si se guardó "undefined" o datos corruptos
      if (!userGuardado || userGuardado === "undefined" || userGuardado === "[object Object]") {
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
    // 3. LIMPIEZA SILENCIOSA: Borramos datos sin forzar recargas agresivas de navegador
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