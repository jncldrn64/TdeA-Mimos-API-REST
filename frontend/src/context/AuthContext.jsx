import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 1. INICIALIZACIÓN INTELIGENTE: Lee de localStorage desde el milisegundo cero.
  // Así sobrevivimos al F5 y a las nuevas pestañas.
  const [usuario, setUsuario] = useState(() => {
    const userGuardado = localStorage.getItem("usuario");
    return userGuardado ? JSON.parse(userGuardado) : null;
  });

  const iniciarSesion = (datosUsuario, token) => {
    setUsuario(datosUsuario);
    localStorage.setItem("usuario", JSON.stringify(datosUsuario));
    localStorage.setItem("token", token);
  };

  const cerrarSesion = () => {
    // 2. BARRIDO DE SEGURIDAD
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    
    // 3. PRIVACIDAD: Borramos el carrito y notifs al salir de la cuenta
    localStorage.removeItem("carrito");
    localStorage.removeItem("notifsLeidas");

    // 4. Forzamos una recarga limpia para destruir cualquier dato residual en RAM
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ usuario, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);