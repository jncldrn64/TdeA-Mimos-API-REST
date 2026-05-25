import { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  // Al cargar la app, revisa si hay alguien guardado en el navegador
  useEffect(() => {
    const userGuardado = localStorage.getItem("usuario");
    if (userGuardado) {
      setUsuario(JSON.parse(userGuardado));
    }
    setCargandoSesion(false);
  }, []);

  // Función global para iniciar sesión
  const iniciarSesion = (token, datosUsuario) => {
    localStorage.setItem("token", token);
    localStorage.setItem("usuario", JSON.stringify(datosUsuario));
    setUsuario(datosUsuario);
  };

  // Función global para cerrar sesión
  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, iniciarSesion, cerrarSesion, cargandoSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar en cualquier componente
export const useAuth = () => useContext(AuthContext);