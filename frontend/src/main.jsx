import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx'; // <-- 1. Importamos el proveedor del carrito
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>  {/* <-- 2. Envolvemos la App por dentro del Auth */}
        <App />
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
);