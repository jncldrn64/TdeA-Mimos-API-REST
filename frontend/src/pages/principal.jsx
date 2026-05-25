import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Principal ahora es solo un redirect al catálogo.
// Todo el contenido de productos está en Catalogo.jsx
export default function Principal() {
  const navigate = useNavigate();
  useEffect(() => { navigate("/catalogo", { replace: true }); }, []);
  return null;
}
