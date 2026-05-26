import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  
  // 1. INICIALIZACIÓN INTELIGENTE
  const [usuario, setUsuario] = useState(() => {
    const userGuardado = localStorage.getItem("usuario");
    return userGuardado ? JSON.parse(userGuardado) : null;
  });

  // ⚠️ Corrección de Bug: El orden (token, datosUsuario) ahora coincide perfectamente con Login.jsx
  const iniciarSesion = (token, datosUsuario) => {
    setUsuario(datosUsuario);
    localStorage.setItem("usuario", JSON.stringify(datosUsuario));
    localStorage.setItem("token", token);
  };

  const cerrarSesion = () => {
    // 1. Vaciamos la memoria RAM (Estado de React)
    setUsuario(null);

    // 2. Vaciamos el disco duro (LocalStorage)
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    localStorage.removeItem("carrito");
    localStorage.removeItem("notifsLeidas");

    // 3. ⚠️ CORRECCIÓN DEL BUCLE: Solo recargamos si NO estamos en la página de Login
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider value={{ usuario, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);